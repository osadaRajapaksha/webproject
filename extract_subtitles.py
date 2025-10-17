import os
import zipfile
import shutil
import re
import concurrent.futures
import time

# === CONFIG ===
SOURCE_FOLDER = r"D:\Downloads\englishsubb"   # your input folder
DEST_FOLDER = r"E:\New_folder"      # where subtitles will go
TEMP_FOLDER = r"E:\temp_extract"    # temp extraction folder
TIMEOUT_SECONDS = 5                 # max seconds to handle each file

# Create destination and temp folders if not exist
os.makedirs(DEST_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

# Subtitle extensions to consider
SUB_EXTENSIONS = ('.srt', '.sub', '.ssa', '.ass', '.vtt')

# Regex to detect TV series patterns
TV_PATTERNS = re.compile(r'(S\d{1,2}E\d{1,2}|Season\s*\d+|Episode\s*\d+)', re.IGNORECASE)


def is_tv_series(name):
    """Return True if the filename suggests it's a TV show."""
    return bool(TV_PATTERNS.search(name))


def safe_extract_zip(zip_path, extract_dir):
    """Safely extract ZIP contents while cleaning filenames."""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for member in zip_ref.infolist():
                try:
                    clean_name = re.sub(r'[<>:"/\\|?*\x00-\x1F]', '', member.filename)
                    target_path = os.path.join(extract_dir, clean_name)
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)

                    if not member.is_dir():
                        with zip_ref.open(member) as source, open(target_path, "wb") as target:
                            shutil.copyfileobj(source, target)
                except Exception as e:
                    print(f"⚠️ Problem extracting a file from {zip_path}: {e}")
    except zipfile.BadZipFile:
        print(f"❌ Invalid ZIP file skipped: {zip_path}")
    except Exception as e:
        print(f"❌ Error opening ZIP {zip_path}: {e}")


def extract_subtitles_from_zip(zip_path, dest_folder, tv_mode):
    """Extract subtitle files safely."""
    start_time = time.time()
    extract_dir = os.path.join(TEMP_FOLDER, os.path.basename(zip_path))
    subtitles_found = []

    try:
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)
        os.makedirs(extract_dir, exist_ok=True)

        safe_extract_zip(zip_path, extract_dir)

        # Check for timeout during extraction
        if time.time() - start_time > TIMEOUT_SECONDS:
            print(f"⏱️ Timeout while extracting {zip_path}, skipped.")
            return

        # Find subtitle files
        for root, _, files in os.walk(extract_dir):
            for file in files:
                if file.lower().endswith(SUB_EXTENSIONS):
                    subtitles_found.append(os.path.join(root, file))

        if not subtitles_found:
            return

        # Copy subtitles based on mode
        if tv_mode:
            for sub_file in subtitles_found:
                try:
                    safe_name = re.sub(r'[<>:"/\\|?*\x00-\x1F]', '', os.path.basename(sub_file))
                    dest_path = os.path.join(dest_folder, safe_name)
                    shutil.copy2(sub_file, dest_path)
                except Exception as e:
                    print(f"⚠️ Failed to copy subtitle {sub_file}: {e}")
        else:
            try:
                sub_file = subtitles_found[0]
                movie_name = os.path.splitext(os.path.basename(zip_path))[0]
                dest_path = os.path.join(dest_folder, f"{movie_name}.srt")
                shutil.copy2(sub_file, dest_path)
            except Exception as e:
                print(f"⚠️ Failed to copy movie subtitle from {zip_path}: {e}")

    except Exception as e:
        print(f"❌ Unexpected error while processing {zip_path}: {e}")
    finally:
        shutil.rmtree(extract_dir, ignore_errors=True)


def process_zip_with_timeout(zip_path, tv_mode):
    """Run ZIP processing with a timeout limit."""
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(extract_subtitles_from_zip, zip_path, DEST_FOLDER, tv_mode)
        try:
            future.result(timeout=TIMEOUT_SECONDS)
        except concurrent.futures.TimeoutError:
            print(f"⏱️ Skipped {zip_path} (took longer than {TIMEOUT_SECONDS} seconds)")
        except Exception as e:
            print(f"❌ Error in thread while processing {zip_path}: {e}")


def main():
    print(f"Extracting subtitles from: {SOURCE_FOLDER}")

    # Optional: auto-clear destination folder
    # shutil.rmtree(DEST_FOLDER, ignore_errors=True)
    # os.makedirs(DEST_FOLDER, exist_ok=True)

    for root, _, files in os.walk(SOURCE_FOLDER):
        for file in files:
            if file.lower().endswith('.zip'):
                zip_path = os.path.join(root, file)
                print(f"Processing: {zip_path}")

                try:
                    tv_mode = is_tv_series(file)
                    process_zip_with_timeout(zip_path, tv_mode)
                except Exception as e:
                    print(f"❌ Skipped {zip_path} due to unexpected error: {e}")

    print("\n✅ Extraction complete (script finished without stopping).")
    shutil.rmtree(TEMP_FOLDER, ignore_errors=True)


if __name__ == "__main__":
    main()
