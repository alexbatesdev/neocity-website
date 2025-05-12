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

def get_all_files():
    """Get a list of all tracked files in the repository, including submodules."""
    # Update submodules
    subprocess.run(["git", "submodule", "update", "--init", "--recursive"], check=True)

    # Get all tracked files
    result = subprocess.run(
        ["git", "ls-files"],
        stdout=subprocess.PIPE,
        text=True,
    )
    return result.stdout.strip().split("\n")

def get_updated_files():
    """Get the list of files updated in the latest commit."""
    result = subprocess.run(
        ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
        stdout=subprocess.PIPE,
        text=True,
    )
    return result.stdout.strip().split("\n")

def get_deleted_files():
    """Get the list of files deleted in the latest commit."""
    result = subprocess.run(
        ["git", "diff", "--name-status", "HEAD~1", "HEAD"],
        stdout=subprocess.PIPE,
        text=True,
    )
    deleted_files = []
    for line in result.stdout.strip().split("\n"):
        if line.startswith("D"):
            _, file = line.split("\t", 1)
            deleted_files.append(file)
    return deleted_files

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
        ".*",
        "music/*/*",
        ".github/*/*",
    ]
    with open(".gitignore", "r") as f:
        ignored_patterns = f.read().splitlines() + custom_patterns
    for file in files:
        for pattern in ignored_patterns:
            if Path(file).match(pattern):
                ignored_files.append(file)
                break
    return ignored_files

def list_ftp_files(ftp, base_dir="/"):
    """Recursively list all files on the FTP server starting from base_dir."""
    files = []
    try:
        items = []
        ftp.retrlines(f'LIST {base_dir}', items.append)
        for item in items:
            parts = item.split()
            name = parts[-1]
            path = os.path.join(base_dir, name).replace("\\", "/")
            if item.startswith('d'):  # Directory
                if name not in ('.', '..'):
                    files.extend(list_ftp_files(ftp, path))
            else:
                files.append(path.lstrip("/"))
    except Exception as e:
        print(f"Error listing FTP directory {base_dir}: {e}")
    return files

def delete_extra_ftp_files():
    """Delete files from FTP that are not present locally."""
    print("Checking for extra files on FTP server to delete...")
    ftp = FTP()
    FTP_HOST = FTP_URL.split(":")[0]
    FTP_PORT = int(FTP_URL.split(":")[1]) if ":" in FTP_URL else 21
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)

    remote_files = list_ftp_files(ftp)
    local_files = get_all_files()
    ignored_files = select_ignored_files(local_files)
    local_files_set = set([file.replace("\\", "/") for file in local_files if file not in ignored_files])

    extra_files = [f for f in remote_files if f not in local_files_set]
    if extra_files:
        print("Deleting files from FTP not present locally:")
        for file in extra_files:
            try:
                ftp.delete("/" + file)
                print(f"Deleted from FTP: {file}")
            except Exception as e:
                print(f"Failed to delete {file} from FTP: {e}")
    else:
        print("No extra files to delete from FTP.")

    ftp.quit()

if __name__ == "__main__":
    if force_upload:
        print("Force upload enabled. Uploading all files...")
        all_files = get_all_files()
        ignored_files = select_ignored_files(all_files)
        print(f"Ignored files: {ignored_files}")
        files_to_upload = [file for file in all_files if file not in ignored_files]
        files_to_delete = get_deleted_files()
    else:
        print("Uploading only updated files...")
        files_to_upload = get_updated_files()
        files_to_delete = get_deleted_files()

    if files_to_upload:
        upload_files(files_to_upload)
    else:
        print("No files to upload.")

    if files_to_delete:
        delete_files_from_ftp(files_to_delete)
    elif not files_to_upload:
        print("No files to delete.")

    # Remove extra files from FTP server that are not present locally
    delete_extra_ftp_files()