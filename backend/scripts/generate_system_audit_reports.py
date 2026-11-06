import csv
import os
import sys
from pathlib import Path

import django
from django.apps import apps
from django.conf import settings
from django.db import connection
from django.db.models import FileField, ImageField


BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")
django.setup()


REPORT_DIR = BASE_DIR / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def get_table_counts():
    rows = []
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
            """
        )
        tables = [item[0] for item in cursor.fetchall()]

        for table in tables:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
                count = cursor.fetchone()[0]
            except Exception:
                count = -1
            rows.append((table, count))
    return rows


def get_model_rows_and_image_fields():
    model_rows = []
    image_fields = []

    for model in apps.get_models():
        meta = model._meta
        try:
            row_count = model.objects.count()
        except Exception:
            row_count = -1

        model_rows.append(
            {
                "app": meta.app_label,
                "model": meta.object_name,
                "table": meta.db_table,
                "count": row_count,
            }
        )

        for field in meta.get_fields():
            if isinstance(field, (FileField, ImageField)):
                upload_to = getattr(field, "upload_to", "")
                if callable(upload_to):
                    upload_to_name = getattr(upload_to, "__name__", str(upload_to))
                    expected_dir = "media_root/media/images/YYYY-MM-DD/<filename>-YYYY-MM-DD-HH-MM-SS.<ext>"
                else:
                    upload_to_name = str(upload_to)
                    expected_dir = f"media_root/media/{upload_to_name}" if upload_to_name else "media_root/media/"

                image_fields.append(
                    {
                        "app": meta.app_label,
                        "model": meta.object_name,
                        "table": meta.db_table,
                        "field": field.name,
                        "upload_to": upload_to_name,
                        "expected_dir": expected_dir,
                    }
                )

    return model_rows, image_fields


def get_db_image_references(image_fields):
    refs = []
    model_map = {(i["app"], i["model"]): i for i in image_fields}

    for model in apps.get_models():
        meta = model._meta
        key = (meta.app_label, meta.object_name)
        model_img_fields = [
            f for f in meta.get_fields() if isinstance(f, (FileField, ImageField))
        ]
        if not model_img_fields:
            continue

        qs = model.objects.all().only("id", *[f.name for f in model_img_fields])
        for obj in qs.iterator():
            for field in model_img_fields:
                value = getattr(obj, field.name)
                if not value:
                    continue
                rel_path = str(value)
                abs_path = str(Path(settings.MEDIA_ROOT) / rel_path)
                refs.append(
                    {
                        "app": meta.app_label,
                        "model": meta.object_name,
                        "table": meta.db_table,
                        "id": obj.pk,
                        "field": field.name,
                        "relative_path": rel_path,
                        "absolute_path": abs_path,
                        "exists_in_fs": Path(abs_path).exists(),
                    }
                )

    return refs


def get_filesystem_images():
    media_root = Path(settings.MEDIA_ROOT)
    files = []
    if not media_root.exists():
        return files

    for p in media_root.rglob("*"):
        if p.is_file():
            ext = p.suffix.lower()
            if ext in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".avi", ".mkv"}:
                files.append(str(p.relative_to(media_root)).replace("\\", "/"))

    files.sort()
    return files


def write_csv(path, fieldnames, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main():
    table_counts = get_table_counts()
    model_rows, image_fields = get_model_rows_and_image_fields()
    db_refs = get_db_image_references(image_fields)
    fs_images = get_filesystem_images()

    write_csv(
        REPORT_DIR / "db_table_counts.csv",
        ["table", "row_count"],
        [{"table": t, "row_count": c} for t, c in table_counts],
    )

    write_csv(
        REPORT_DIR / "model_row_counts.csv",
        ["app", "model", "table", "count"],
        model_rows,
    )

    write_csv(
        REPORT_DIR / "model_image_fields.csv",
        ["app", "model", "table", "field", "upload_to", "expected_dir"],
        image_fields,
    )

    write_csv(
        REPORT_DIR / "db_image_references.csv",
        ["app", "model", "table", "id", "field", "relative_path", "absolute_path", "exists_in_fs"],
        db_refs,
    )

    with open(REPORT_DIR / "filesystem_image_list.txt", "w", encoding="utf-8") as f:
        for rel in fs_images:
            f.write(rel + "\n")

    # বাংলা markdown summary
    with open(REPORT_DIR / "audit_summary_bn.md", "w", encoding="utf-8") as f:
        f.write("# BEGAUTOS সিস্টেম অডিট রিপোর্ট (বাংলা)\n\n")
        f.write("## 1) DB Index (টেবিল ও ডাটা কাউন্ট)\n")
        f.write(f"- মোট টেবিল: {len(table_counts)}\n")
        f.write(f"- মোট Django model: {len(model_rows)}\n")
        f.write("- বিস্তারিত: `reports/db_table_counts.csv`, `reports/model_row_counts.csv`\n\n")

        f.write("## 2) মডেলভিত্তিক Image/File Field তালিকা\n")
        f.write(f"- মোট image/file field: {len(image_fields)}\n")
        f.write("- বিস্তারিত: `reports/model_image_fields.csv`\n\n")

        f.write("## 3) DB-তে থাকা Image রেফারেন্স\n")
        f.write(f"- মোট image reference: {len(db_refs)}\n")
        missing = sum(1 for r in db_refs if not r["exists_in_fs"])
        f.write(f"- filesystem-এ না থাকা reference: {missing}\n")
        f.write("- বিস্তারিত: `reports/db_image_references.csv`\n\n")

        f.write("## 4) Filesystem-এ থাকা Image/Media ফাইল\n")
        f.write(f"- মোট image/media file: {len(fs_images)}\n")
        f.write("- বিস্তারিত: `reports/filesystem_image_list.txt`\n\n")

        f.write("## 5) Backup System (বর্তমান অবস্থা)\n")
        f.write("- প্রজেক্টে PostgreSQL dump ফাইল আছে: `backup/db_begautos.sql`\n")
        f.write("- SQLite DB ফাইল: `db.sqlite3`\n")
        f.write("- PostgreSQL dump থেকে SQLite-এ import স্ক্রিপ্ট আছে: `import_pg_to_sqlite.py`\n")
        f.write("- বর্তমানে automatic scheduled backup script পাওয়া যায়নি; মানে backup প্রক্রিয়া manual/script-driven.\n\n")

        f.write("## 6) Image Saving System\n")
        f.write("- বেশিরভাগ image field `upload_to=images_path_dir` ব্যবহার করে।\n")
        f.write("- `images_path_dir` ফাইলকে এই pattern-এ সেভ করে: `images/YYYY-MM-DD/<filename>-YYYY-MM-DD-HH-MM-SS.<ext>`\n")
        f.write("- Absolute root: `MEDIA_ROOT = backend/media_root/media`\n")
        f.write("- Media URL: `/media/`\n")
        f.write("- Inventory image order `order` ascending দিয়ে সাজানো হয়; same order হলে `id` ascending fallback।\n")

    print("Reports generated in:", REPORT_DIR)
    print("- db_table_counts.csv")
    print("- model_row_counts.csv")
    print("- model_image_fields.csv")
    print("- db_image_references.csv")
    print("- filesystem_image_list.txt")
    print("- audit_summary_bn.md")


if __name__ == "__main__":
    main()
