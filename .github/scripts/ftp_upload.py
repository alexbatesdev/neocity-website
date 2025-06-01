import os
import time
import sys
from ftplib import FTP
import subprocess
from pathlib import Path
import hashlib
import json
import tempfile

# FTP server credentials
FTP_URL = sys.argv[1]
FTP_USER = sys.argv[2]
FTP_PASS = sys.argv[3]
force_upload = sys.argv[4] == "true" if len(sys.argv) > 4 else False  # Force upload flag
dry_run = sys.argv[5] == "true" if len(sys.argv) > 5 else False  # Dry run flag

# Rate limit: 250 edits per 15 minutes
RATE_LIMIT = 250
TIME_WINDOW = 15 * 60  # 15 minutes in seconds

MANIFEST_FILE = ".ftp_manifest.json"

def hash_file(path):
    """Return SHA256 hash of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def build_local_manifest(files):
    """Return dict {relative_path: sha256} for local files."""
    return {f: hash_file(f) for f in files if os.path.isfile(f)}

def download_remote_manifest(ftp):
    """Download and parse manifest from server, or return empty dict."""
    try:
        with tempfile.NamedTemporaryFile(delete=True) as tmp:
            ftp.retrbinary(f"RETR /{MANIFEST_FILE}", tmp.write)
            tmp.flush()
            tmp.seek(0)
            return json.load(tmp)
    except Exception:
        return {}

def upload_manifest(ftp, manifest):
    """Upload manifest JSON to server."""
    # Close the old connection if needed, and open a new one
    try:
        ftp.quit()
    except Exception:
        pass
    ftp = FTP()
    FTP_HOST = FTP_URL.split(":")[0]
    FTP_PORT = int(FTP_URL.split(":")[1]) if ":" in FTP_URL else 21
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)
    with tempfile.NamedTemporaryFile("w+", delete=False) as tmp:
        json.dump(manifest, tmp, indent=2)
        tmp.flush()
        tmp.seek(0)
        with open(tmp.name, "rb") as f:
            ftp.storbinary(f"STOR /" + MANIFEST_FILE, f)
    os.unlink(tmp.name)
    ftp.quit()

def build_local_file_tree():
    """Return a set of all local files (relative paths, including submodules)."""
    local_files = set()
    # Main repo
    for root, dirs, files in os.walk("."):
        for file in files:
            path = os.path.relpath(os.path.join(root, file), ".").replace("\\", "/")
            local_files.add(path)
    # Submodules
    submodules = subprocess.run(
        ["git", "config", "--file", ".gitmodules", "--get-regexp", "path"],
        stdout=subprocess.PIPE,
        text=True,
    )
    submodule_paths = [line.split(" ")[1] for line in submodules.stdout.strip().split("\n") if line]
    for submodule in submodule_paths:
        for root, dirs, files in os.walk(submodule):
            for file in files:
                path = os.path.relpath(os.path.join(root, file), ".").replace("\\", "/")
                local_files.add(path)
    return local_files

def build_remote_file_tree(ftp, base_dir="/"):
    """Return a set of all remote files (relative paths from FTP root)."""
    files = set()
    try:
        items = []
        ftp.retrlines(f'LIST {base_dir}', items.append)
        for item in items:
            parts = item.split()
            name = parts[-1]
            path = os.path.join(base_dir, name).replace("\\", "/")
            if item.startswith('d'):
                if name not in ('.', '..'):
                    files |= build_remote_file_tree(ftp, path)
            else:
                files.add(path.lstrip("/"))
    except Exception as e:
        print(f"Error listing FTP directory {base_dir}: {e}", flush=True)
    return files

def ensure_ftp_dirs(ftp, remote_path):
    """Ensure all directories in remote_path exist on the FTP server."""
    dirs = remote_path.strip("/").split("/")[:-1]
    path = ""
    for d in dirs:
        path += "/" + d
        try:
            ftp.mkd(path)
        except Exception:
            pass

def upload_files(files):
    """Upload files to the FTP server with retry on 550 errors and broken pipe."""
    if dry_run:
        print("Dry run enabled. The following files would be uploaded:", flush=True)
        for file in files:
            print(f" - {file}", flush=True)
        return

    ftp = FTP()
    FTP_HOST = FTP_URL.split(":")[0]
    FTP_PORT = int(FTP_URL.split(":")[1]) if ":" in FTP_URL else 21
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.voidcmd('TYPE I')  # Set binary mode

    edits = 0
    start_time = time.time()
    MAX_RETRIES = 5
    RETRY_WAIT = 30  # seconds

    for file in files:
        if not os.path.isfile(file):
            continue  # Skip directories or non-existent files

        remote_path = os.path.join("/", file).replace("\\", "/")
        ensure_ftp_dirs(ftp, remote_path)

        retries = 0
        while retries <= MAX_RETRIES:
            try:
                with open(file, "rb") as f:
                    ftp.storbinary(f"STOR {remote_path}", f)
                print(f"Uploaded: {file}", flush=True)
                edits += 1
                break  # Success, exit retry loop
            except Exception as e:
                error_str = str(e)
                if ("550" in error_str and "No such file or directory" in error_str):
                    print(f"Directory missing for {file}, creating directories and retrying...", flush=True)
                    ensure_ftp_dirs(ftp, remote_path)
                    retries += 1
                    continue
                if ("550" in error_str or "Broken pipe" in error_str) and retries < MAX_RETRIES:
                    wait_time = RETRY_WAIT * (retries + 1)
                    print(f"Error uploading {file}: {e}. Retrying in {wait_time} seconds... (Attempt {retries+1}/{MAX_RETRIES})", flush=True)
                    time.sleep(wait_time)
                    try:
                        ftp.quit()
                    except Exception:
                        pass
                    ftp = FTP()
                    ftp.connect(FTP_HOST, FTP_PORT)
                    ftp.login(FTP_USER, FTP_PASS)
                    ftp.voidcmd('TYPE I')
                    retries += 1
                else:
                    print(f"Failed to upload {file}: {e}", flush=True)
                    break

        if edits >= RATE_LIMIT:
            elapsed_time = time.time() - start_time
            if elapsed_time < TIME_WINDOW:
                sleep_time = TIME_WINDOW - elapsed_time
                print(f"Rate limit reached. Sleeping for {sleep_time} seconds.", flush=True)
                time.sleep(sleep_time)
                start_time = time.time()
                edits = 0

    ftp.quit()

def delete_files_from_ftp(files):
    """Delete files from the FTP server."""
    if dry_run:
        print("Dry run enabled. The following files would be deleted from FTP:", flush=True)
        for file in files:
            print(f" - {file}", flush=True)
        return

    ftp = FTP()
    FTP_HOST = FTP_URL.split(":")[0]
    FTP_PORT = int(FTP_URL.split(":")[1]) if ":" in FTP_URL else 21
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)

    for file in files:
        remote_path = os.path.join("/", file).replace("\\", "/")
        try:
            ftp.delete(remote_path)
            print(f"Deleted from FTP: {file}", flush=True)
        except Exception as e:
            print(f"Failed to delete {file} from FTP: {e}", flush=True)

    ftp.quit()

def select_ignored_files(files):
    # Ignore files that are in the .gitignore
    ignored_files = []
    custom_patterns = [
        "/music/",
        ".github",
        ".git",
        MANIFEST_FILE,
    ]
    with open(".gitignore", "r") as f:
        ignored_patterns = f.read().splitlines() + custom_patterns
    for file in files:
        for pattern in ignored_patterns:
            if any(part == pattern for part in Path(file).parts):
                ignored_files.append(file)
                break
            if any(part.startswith(".") for part in Path(file).parts):
                ignored_files.append(file)
                break
    return ignored_files

def sync_file_trees():
    """Sync local and remote file trees: upload new/changed, delete missing."""
    print("Building local file tree...", flush=True)
    local_files = build_local_file_tree()
    print(f"Local files: {len(local_files)}", flush=True)
    ignored_files = set(select_ignored_files(local_files))
    local_files = local_files - ignored_files

    print("Hashing local files...", flush=True)
    local_manifest = build_local_manifest(local_files)

    ftp = FTP()
    FTP_HOST = FTP_URL.split(":")[0]
    FTP_PORT = int(FTP_URL.split(":")[1]) if ":" in FTP_URL else 21
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)
    print("Downloading remote manifest...", flush=True)
    remote_manifest = download_remote_manifest(ftp)

    files_to_upload = [f for f in local_manifest
                       if f not in remote_manifest or local_manifest[f] != remote_manifest[f]]

    files_to_delete = [f for f in remote_manifest if f not in local_manifest]

    print("Files to upload:", flush=True)
    for file in files_to_upload:
        print(f" - {file}", flush=True)
    print("Files to delete:", flush=True)
    for file in files_to_delete:
        print(f" - {file}", flush=True)

    print(f"Files to upload: {len(files_to_upload)}", flush=True)
    print(f"Files to delete: {len(files_to_delete)}", flush=True)
    print(f"Files to ignore: {len(ignored_files)}", flush=True)
    print(f"Total local files: {len(local_files)}", flush=True)
    print(f"Total remote files (from manifest): {len(remote_manifest)}", flush=True)

    if files_to_upload:
        upload_files(files_to_upload)
    else:
        print("No files to upload.", flush=True)

    if files_to_delete:
        delete_files_from_ftp(files_to_delete)
    else:
        print("No files to delete.", flush=True)

    print("Uploading new manifest...", flush=True)
    upload_manifest(ftp, local_manifest)

    ftp.quit()

if __name__ == "__main__":
    sync_file_trees()