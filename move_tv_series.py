import os
import shutil
import re

def move_tv_items(src, dst):
    os.makedirs(dst, exist_ok=True)

    # Broad regex to match all TV series naming styles
    pattern = re.compile(r'(?i)(season|[-_]?season[-_]?|s0|tv|episode|e0|[-_]?tv[-_]?|[-_]?episode[-_]?)')

    moved, skipped = [], []

    for item_name in os.listdir(src):
        item_path = os.path.join(src, item_name)

        if pattern.search(item_name):
            try:
                dest_path = os.path.join(dst, item_name)
                
                # Avoid overwriting existing folders/files
                counter = 1
                while os.path.exists(dest_path):
                    dest_path = os.path.join(dst, f"{item_name}_{counter}")
                    counter += 1

                print(f"📂 Moving: {item_name}")
                shutil.move(item_path, dest_path)
                moved.append(item_name)

            except Exception as e:
                print(f"❌ Failed to move {item_name}: {e}")
        else:
            skipped.append(item_name)

    print("\n✅ Done!")
    print(f"Moved: {len(moved)} items")
    print(f"Skipped: {len(skipped)} items")

    if skipped:
        print("\nSkipped items:")
        for name in skipped:
            print(f" - {name}")

if __name__ == "__main__":
    src = r"D:\Downloads\englishsubb"   # source folder
    dst = r"D:\Downloads\tv_series"     # destination folder
    move_tv_items(src, dst)
