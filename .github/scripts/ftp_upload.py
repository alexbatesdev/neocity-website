import os
import time
import sys
from ftplib import FTP
import subprocess
from pathlib import Path

# FTP server credentials
FTP_URL = sys.argv[1]
FTP_USER = sys.argv[2]
FTP_PASS = sys.argv[3]
force_upload = sys.argv[4] == "true" if len(sys.argv) > 4 else False  # Force upload flag
dry_run = sys.argv[5] == "true" if len(sys.argv) > 5 else False  # Dry run flag

# Rate limit: 250 edits per 15 minutes
RATE_LIMIT = 250
TIME_WINDOW = 15 * 60  # 15 minutes in seconds


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
        # for item in items:
        #     print(item)
        for item in items:
            # print("---------------")
            # print(item)
            parts = item.split()
            name = parts[-1]
            # print(name)
            path = os.path.join(base_dir, name).replace("\\", "/")
            print(path)
            if item.startswith('d'):
                if name not in ('.', '..'):
                    files |= build_remote_file_tree(ftp, path)
            else:
                files.add(path.lstrip("/"))
    except Exception as e:
        print(f"Error listing FTP directory {base_dir}: {e}")
    return files

def ensure_ftp_dirs(ftp, remote_path):
    """Ensure all directories in remote_path exist on the FTP server."""
    dirs = remote_path.strip("/").split("/")[:-1]
    path = ""
    for d in dirs:
        path += "/" + d
        try:
            ftp.mkd(path)
        except Exception as e:
            # Directory may already exist, ignore error
            pass

def upload_files(files):
    """Upload files to the FTP server with retry on 550 errors and broken pipe."""
    if dry_run:
        print("Dry run enabled. The following files would be uploaded:")
        for file in files:
            print(f" - {file}")
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
                print(f"Uploaded: {file}")
                edits += 1
                break  # Success, exit retry loop
            except Exception as e:
                error_str = str(e)
                # If directory does not exist, create it and retry immediately
                if ("550" in error_str and "No such file or directory" in error_str):
                    print(f"Directory missing for {file}, creating directories and retrying...")
                    ensure_ftp_dirs(ftp, remote_path)
                    retries += 1
                    continue
                if ("550" in error_str or "Broken pipe" in error_str) and retries < MAX_RETRIES:
                    wait_time = RETRY_WAIT * (retries + 1)
                    print(f"Error uploading {file}: {e}. Retrying in {wait_time} seconds... (Attempt {retries+1}/{MAX_RETRIES})")
                    time.sleep(wait_time)
                    # Reconnect FTP in case of broken pipe
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
                    print(f"Failed to upload {file}: {e}")
                    break  # Give up after max retries or non-retryable error

        # Enforce rate limit
        if edits >= RATE_LIMIT:
            elapsed_time = time.time() - start_time
            if elapsed_time < TIME_WINDOW:
                sleep_time = TIME_WINDOW - elapsed_time
                print(f"Rate limit reached. Sleeping for {sleep_time} seconds.")
                time.sleep(sleep_time)
                start_time = time.time()
                edits = 0

    ftp.quit()

def delete_files_from_ftp(files):
    """Delete files from the FTP server."""
    if dry_run:
        print("Dry run enabled. The following files would be deleted from FTP:")
        for file in files:
            print(f" - {file}")
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
            print(f"Deleted from FTP: {file}")
        except Exception as e:
            print(f"Failed to delete {file} from FTP: {e}")

    ftp.quit()

def select_ignored_files(files):
    # Ignore files that are in the .gitignore
    ignored_files = []
    custom_patterns = [
        "/music/",
        ".github",
        ".git",
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

def get_local_file_mtimes(files):
    """Return a dict of {relative_path: mtime} for local files."""
    return {f: int(os.path.getmtime(f)) for f in files if os.path.isfile(f)}

def get_remote_file_mtimes(ftp, files):
    """Return a dict of {relative_path: mtime} for remote files using MDTM."""
    mtimes = {}
    for f in files:
        remote_path = "/" + f
        try:
            resp = ftp.sendcmd(f"MDTM {remote_path}")
            # Response: '213 20240518123456'
            if resp.startswith("213 "):
                # Convert to epoch time
                timestr = resp[4:].strip()
                mtime = time.mktime(time.strptime(timestr, "%Y%m%d%H%M%S"))
                mtimes[f] = int(mtime)
        except Exception:
            pass  # File may not exist or MDTM not supported
    return mtimes

def sync_file_trees():
    """Sync local and remote file trees: upload new/changed, delete missing."""
    print("Building local file tree...")
    local_files = build_local_file_tree()
    print(f"Local files: {len(local_files)}")
    ignored_files = set(select_ignored_files(local_files))
    local_files = local_files - ignored_files

    # Build remote file tree
    ftp = FTP()
    FTP_HOST = FTP_URL.split(":")[0]
    FTP_PORT = int(FTP_URL.split(":")[1]) if ":" in FTP_URL else 21
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)
    print("Building remote file tree...")
    remote_files = build_remote_file_tree(ftp)

    # Get mtimes
    local_mtimes = get_local_file_mtimes(local_files)
    remote_mtimes = get_remote_file_mtimes(ftp, remote_files)

    # Files to upload: new or updated
    files_to_upload = []
    for f in local_files:
        if f not in remote_files:
            files_to_upload.append(f)
        elif f in remote_mtimes and local_mtimes.get(f, 0) > remote_mtimes.get(f, 0):
            files_to_upload.append(f)

    # Files to delete: in remote but not local
    files_to_delete = list(remote_files - local_files)

    print("Files to upload:")
    for file in files_to_upload:
        print(f" - {file}")

    print("Files to delete:")
    for file in files_to_delete:
        print(f" - {file}")
      
    # print("Ignored files:")
    # for file in ignored_files:
    #     print(f" - {file}")

    print(f"Files to upload: {len(files_to_upload)}")
    print(f"Files to delete: {len(files_to_delete)}")
    print(f"Files to ignore: {len(ignored_files)}")
    print(f"Total local files: {len(local_files)}")
    print(f"Total remote files: {len(remote_files)}")
    # input("Press Enter to continue...")

    if files_to_upload:
        upload_files(files_to_upload)
    else:
        print("No files to upload.")

    if files_to_delete:
        delete_files_from_ftp(files_to_delete)
    else:
        print("No files to delete.")

    ftp.quit()

if __name__ == "__main__":
    sync_file_trees()