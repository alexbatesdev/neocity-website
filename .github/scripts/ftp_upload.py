import os
import time
from ftplib import FTP
import subprocess
from pathlib import Path

# FTP server credentials
FTP_HOST = os.environ.get("FTP_HOST")
print(FTP_HOST)
FTP_USER = os.environ.get("FTP_USER")
FTP_PASS = os.environ.get("FTP_PASS")

# Rate limit: 250 edits per 15 minutes
RATE_LIMIT = 250
TIME_WINDOW = 15 * 60  # 15 minutes in seconds

def get_git_ignored_files():
    """Get a list of files ignored by .gitignore."""
    result = subprocess.run(
        ["git", "ls-files", "--others", "--ignored", "--exclude-standard"],
        stdout=subprocess.PIPE,
        text=True,
    )
    return set(result.stdout.strip().split("\n"))

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

def upload_files(files):
    """Upload files to the FTP server."""
    ftp = FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)

    edits = 0
    start_time = time.time()

    for file in files:
        if not os.path.isfile(file):
            continue  # Skip directories or non-existent files

        with open(file, "rb") as f:
            remote_path = os.path.join("/", file).replace("\\", "/")
            try:
                ftp.storbinary(f"STOR {remote_path}", f)
                print(f"Uploaded: {file}")
                edits += 1
            except Exception as e:
                print(f"Failed to upload {file}: {e}")

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

if __name__ == "__main__":
    force_upload = os.environ.get("FORCE_UPLOAD", "false").lower() == "true"

    if force_upload:
        print("Force upload enabled. Uploading all files...")
        all_files = get_all_files()
        ignored_files = get_git_ignored_files()
        files_to_upload = [file for file in all_files if file not in ignored_files]
    else:
        print("Uploading only updated files...")
        files_to_upload = get_updated_files()

    if files_to_upload:
        print(f"Files to upload: {files_to_upload}")
        upload_files(files_to_upload)
    else:
        print("No files to upload.")