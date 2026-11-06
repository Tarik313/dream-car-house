#!/usr/bin/env python
"""
DB Image Audit & Fix Script
============================
Scans every image-bearing DB record, checks if the referenced file actually
exists on disk, and if not, tries to find the correct file (possibly with a
different extension, e.g. .jpg -> .webp) and updates the DB path accordingly.

Usage:
    python db_image_audit.py --dry-run     # preview changes (default)
    python db_image_audit.py --execute     # apply changes to DB

MEDIA_ROOT is auto-detected from Django settings.
"""

import os
import sys
import sqlite3
from datetime import datetime
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = BACKEND_DIR / "db.sqlite3"
MEDIA_ROOT = BACKEND_DIR / "media_root" / "media"

# All tables and their image column name + primary key column
TABLES = [
    ("tbl_inventories",           "feature_image", "id"),
    ("tbl_inventory_images",      "image",         "id"),
    ("tbl_brand",                 "image",         "id"),
    ("tbl_stocks",                "image",         "id"),
    ("tbl_video",                 "image",         "id"),
    ("tbl_people_talk",           "image",         "id"),
    ("tbl_sell_your_cars_images", "image",         "id"),
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".svg", ".avif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv"}
MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS

LOG_FILE = BACKEND_DIR / f"db_image_audit_log_{datetime.now().strftime('%Y-%m-%d_%H-%M')}.txt"


def log(msg, file_handle=None):
    print(msg)
    if file_handle:
        file_handle.write(msg + "\n")


def find_actual_file(media_root: Path, db_path: str):
    """
    Given a DB path like 'images/2025-08-04/foo-2025-08-04-18-45-41.jpg',
    check if the file exists. If not, try alternative extensions.
    Returns (actual_path_relative, status) where status is one of:
        'ok'       - file exists at DB path
        'fixed'    - file found with different extension
        'missing'  - file not found at all
    """
    full_path = media_root / db_path
    if full_path.exists():
        return db_path, "ok"

    # Try alternative extensions
    stem = full_path.stem
    parent = full_path.parent
    db_ext = full_path.suffix.lower()

    if not parent.exists():
        return db_path, "missing"

    # Search for files with same stem but different extension
    for candidate in parent.iterdir():
        if candidate.is_file():
            c_stem = candidate.stem
            c_ext = candidate.suffix.lower()
            if c_stem == stem and c_ext in MEDIA_EXTENSIONS and c_ext != db_ext:
                # Found a match with different extension
                new_rel = str(Path(db_path).parent / candidate.name).replace("\\", "/")
                return new_rel, "fixed"

    return db_path, "missing"


def main():
    mode = "dry-run"
    if len(sys.argv) > 1:
        if sys.argv[1] == "--execute":
            mode = "execute"
        elif sys.argv[1] == "--dry-run":
            mode = "dry-run"
        else:
            print(f"Unknown argument: {sys.argv[1]}")
            print("Usage: python db_image_audit.py [--dry-run | --execute]")
            sys.exit(1)

    if not DB_PATH.exists():
        print(f"ERROR: Database not found at {DB_PATH}")
        sys.exit(1)

    if not MEDIA_ROOT.exists():
        print(f"ERROR: MEDIA_ROOT not found at {MEDIA_ROOT}")
        sys.exit(1)

    log_fh = open(LOG_FILE, "w", encoding="utf-8")

    log(f"=" * 70, log_fh)
    log(f"DB Image Audit — {datetime.now().isoformat()}", log_fh)
    log(f"Mode: {mode.upper()}", log_fh)
    log(f"Database: {DB_PATH}", log_fh)
    log(f"Media root: {MEDIA_ROOT}", log_fh)
    log(f"=" * 70, log_fh)

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    total_records = 0
    total_ok = 0
    total_fixed = 0
    total_missing = 0
    total_empty = 0
    total_video_skip = 0
    updates = []  # (table, pk_col, pk_val, img_col, old_path, new_path)

    for table, img_col, pk_col in TABLES:
        log(f"\n{'─' * 50}", log_fh)
        log(f"Table: {table} (column: {img_col})", log_fh)
        log(f"{'─' * 50}", log_fh)

        try:
            cursor.execute(f'SELECT "{pk_col}", "{img_col}" FROM "{table}"')
        except sqlite3.OperationalError as e:
            log(f"  ERROR: Could not query table — {e}", log_fh)
            continue

        rows = cursor.fetchall()
        table_ok = 0
        table_fixed = 0
        table_missing = 0
        table_empty = 0
        table_video_skip = 0

        for pk_val, img_path in rows:
            total_records += 1

            if not img_path or not img_path.strip():
                table_empty += 1
                total_empty += 1
                continue

            img_path = img_path.strip()

            # Skip video files — leave them as-is
            ext = Path(img_path).suffix.lower()
            if ext in VIDEO_EXTENSIONS:
                table_video_skip += 1
                total_video_skip += 1
                continue

            actual_path, status = find_actual_file(MEDIA_ROOT, img_path)

            if status == "ok":
                table_ok += 1
                total_ok += 1
            elif status == "fixed":
                table_fixed += 1
                total_fixed += 1
                updates.append((table, pk_col, pk_val, img_col, img_path, actual_path))
                log(f"  FIX: [{pk_col}={pk_val}] {img_path} -> {actual_path}", log_fh)
            elif status == "missing":
                table_missing += 1
                total_missing += 1
                log(f"  MISSING: [{pk_col}={pk_val}] {img_path}", log_fh)

        log(f"  Summary: {len(rows)} rows | {table_ok} ok | {table_fixed} fixable | {table_missing} missing | {table_empty} empty | {table_video_skip} video(skip)", log_fh)

    log(f"\n{'=' * 70}", log_fh)
    log(f"GRAND TOTAL", log_fh)
    log(f"  Records scanned: {total_records}", log_fh)
    log(f"  OK (file exists): {total_ok}", log_fh)
    log(f"  Fixable (ext mismatch): {total_fixed}", log_fh)
    log(f"  Missing (no file found): {total_missing}", log_fh)
    log(f"  Empty (no path in DB): {total_empty}", log_fh)
    log(f"  Video (skipped): {total_video_skip}", log_fh)
    log(f"{'=' * 70}", log_fh)

    if mode == "execute" and updates:
        log(f"\nApplying {len(updates)} path fixes ...", log_fh)
        for table, pk_col, pk_val, img_col, old_path, new_path in updates:
            cursor.execute(
                f'UPDATE "{table}" SET "{img_col}" = ? WHERE "{pk_col}" = ?',
                (new_path, pk_val)
            )
        conn.commit()
        log(f"Done — {len(updates)} records updated.", log_fh)
    elif mode == "dry-run" and updates:
        log(f"\nDRY RUN — {len(updates)} records would be updated. Run with --execute to apply.", log_fh)
    else:
        log(f"\nNo updates needed.", log_fh)

    conn.close()
    log_fh.close()

    print(f"\nLog written to: {LOG_FILE}")


if __name__ == "__main__":
    main()
