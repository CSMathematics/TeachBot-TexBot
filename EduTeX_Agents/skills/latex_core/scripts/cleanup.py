import os
import glob

def cleanup_junk(directory="."):
    """
    Removes LaTeX auxiliary files recursively or in current dir.
    """
    # Extensions to remove
    junk_exts = {'aux', 'log', 'out', 'toc', 'fls', 'fdb_latexmk', 'synctex.gz', 'nav', 'snm', 'bbl', 'blg'}
    
    deleted_count = 0
    
    print(f"🧹 Cleaning up LaTeX temporary files in {os.path.abspath(directory)}...")
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            ext = file.split('.')[-1]
            if ext in junk_exts:
                file_path = os.path.join(root, file)
                try:
                    os.remove(file_path)
                    print(f"   🗑️  Deleted {file}")
                    deleted_count += 1
                except OSError as e:
                    print(f"   ❌ Error deleting {file}: {e}")
                    
    print(f"✨ Cleanup complete. Removed {deleted_count} files.")

if __name__ == "__main__":
    cleanup_junk()
