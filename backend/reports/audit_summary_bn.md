# BEGAUTOS সিস্টেম অডিট রিপোর্ট (বাংলা)

## 1) DB Index (টেবিল ও ডাটা কাউন্ট)
- মোট টেবিল: 24
- মোট Django model: 20
- বিস্তারিত: `reports/db_table_counts.csv`, `reports/model_row_counts.csv`

## 2) মডেলভিত্তিক Image/File Field তালিকা
- মোট image/file field: 7
- বিস্তারিত: `reports/model_image_fields.csv`

## 3) DB-তে থাকা Image রেফারেন্স
- মোট image reference: 3423
- filesystem-এ না থাকা reference: 0
- বিস্তারিত: `reports/db_image_references.csv`

## 4) Filesystem-এ থাকা Image/Media ফাইল
- মোট image/media file: 4581
- বিস্তারিত: `reports/filesystem_image_list.txt`

## 5) Backup System (বর্তমান অবস্থা)
- প্রজেক্টে PostgreSQL dump ফাইল আছে: `backup/db_begautos.sql`
- SQLite DB ফাইল: `db.sqlite3`
- PostgreSQL dump থেকে SQLite-এ import স্ক্রিপ্ট আছে: `import_pg_to_sqlite.py`
- বর্তমানে automatic scheduled backup script পাওয়া যায়নি; মানে backup প্রক্রিয়া manual/script-driven.

## 6) Image Saving System
- বেশিরভাগ image field `upload_to=images_path_dir` ব্যবহার করে।
- `images_path_dir` ফাইলকে এই pattern-এ সেভ করে: `images/YYYY-MM-DD/<filename>-YYYY-MM-DD-HH-MM-SS.<ext>`
- Absolute root: `MEDIA_ROOT = backend/media_root/media`
- Media URL: `/media/`
- Inventory image order `order` ascending দিয়ে সাজানো হয়; same order হলে `id` ascending fallback।
