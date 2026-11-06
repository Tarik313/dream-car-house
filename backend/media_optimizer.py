#!/usr/bin/env python
"""
Media Optimization Agent
========================
MISSION A: Compress and convert all media images to WebP (quality=82, method=6)
MISSION B: Identify orphaned images and quarantine them (never delete)

Run from: backend/ directory
Usage: python media_optimizer.py
"""

import os
import sys
import shutil
import datetime
import re
from pathlib import Path

# ─── 0. Django Setup ──────────────────────────────────────────────────────────
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(PROJECT_DIR, '.env'))
except ImportError:
    pass

import django
django.setup()

from django.conf import settings

# ─── Config ───────────────────────────────────────────────────────────────────
MEDIA_ROOT = Path(settings.MEDIA_ROOT)
NOW = datetime.datetime.now()
TIMESTAMP = NOW.strftime('%Y-%m-%d_%H-%M')
TODAY = NOW.date()
CUTOFF_DATE = TODAY - datetime.timedelta(days=7)  # files newer than this → skip

LOG_FILE = Path(PROJECT_DIR) / f"media_optimization_log_{TIMESTAMP}.txt"
QUARANTINE_DIR = MEDIA_ROOT.parent.parent / f"media_quarantine_{TODAY.strftime('%Y-%m-%d')}"

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.ico', '.svg'}
SKIP_CONVERSION  = {'.svg', '.gif', '.mp4', '.mov', '.avi', '.webm', '.mkv'}  # never convert these

SAFE_FILENAME_PREFIXES = {'default', 'placeholder', 'no-image', 'fallback', 'blank', 'no_image'}
SAFE_SUBDIRS = {'defaults', 'static', 'system', 'protected'}

# Models with image/file fields (app_label, model_name, field_name)
IMAGE_MODELS = [
    ('inventory', 'Inventory',        'feature_image'),
    ('inventory', 'InventoryImage',   'image'),
    ('inventory', 'Brand',            'image'),
    ('inventory', 'Stock',            'image'),
    ('home',      'Slider',           'image'),
    ('home',      'SellYourCarImages','image'),
    ('home',      'PeopleTalkAboutUs','image'),
]

# ─── Logger ───────────────────────────────────────────────────────────────────
_log_lines = []
_log_fh = None

def _open_log():
    global _log_fh
    _log_fh = open(LOG_FILE, 'w', encoding='utf-8')

def log(msg='', also_print=True):
    _log_lines.append(msg)
    if _log_fh:
        _log_fh.write(msg + '\n')
        _log_fh.flush()
    if also_print:
        print(msg)

def section(title):
    log()
    log('=' * 65)
    log(title)
    log('=' * 65)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 0 — PRE-FLIGHT CHECKS
# ─────────────────────────────────────────────────────────────────────────────
_open_log()

section("PHASE 0 — PRE-FLIGHT CHECKS")

# 0.1 Custom storage check
default_storage = getattr(settings, 'DEFAULT_FILE_STORAGE', 'django.core.files.storage.FileSystemStorage')
if any(kw in default_storage for kw in ('S3', 'storages', 'GCS', 'Azure', 'Boto')):
    log(f"⛔  STOP: Custom storage backend detected: {default_storage}")
    log("    This script is for local filesystem only. Aborting.")
    sys.exit(1)

log(f"  Storage backend : {default_storage} (local ✓)")
log(f"  MEDIA_ROOT      : {MEDIA_ROOT}")
log(f"  MEDIA_URL       : {settings.MEDIA_URL}")
log(f"  BASE_DIR        : {settings.BASE_DIR}")
log(f"  Quarantine dir  : {QUARANTINE_DIR}")
log(f"  Log file        : {LOG_FILE}")
log(f"  Cutoff date     : {CUTOFF_DATE} (files newer than this are skipped)")

# 0.2 Pillow check
try:
    from PIL import Image as PilImage
    log(f"  Pillow          : {PilImage.__version__} ✓")
except ImportError:
    log("  Pillow missing — installing...")
    import subprocess
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'Pillow'], check=True)
    from PIL import Image as PilImage
    log(f"  Pillow          : installed ✓")

# 0.3 Baseline measurement
log()
log("  Measuring baseline disk usage…")
_baseline_count  = 0
_baseline_bytes  = 0
_ext_baseline    = {}

for _root, _dirs, _fnames in os.walk(MEDIA_ROOT):
    _dirs[:] = [d for d in _dirs if not d.startswith('media_quarantine')]
    for _fn in _fnames:
        _fp = Path(_root) / _fn
        _ext = _fp.suffix.lower()
        if _ext in IMAGE_EXTENSIONS or _ext in {'.mp4', '.mov', '.avi'}:
            try:
                _sz = _fp.stat().st_size
                _baseline_count += 1
                _baseline_bytes += _sz
                _ext_baseline[_ext] = _ext_baseline.get(_ext, 0) + _sz
            except OSError:
                pass

log()
log("PRE-FLIGHT BASELINE")
log("===================")
log(f"  MEDIA_ROOT     : {MEDIA_ROOT}")
log(f"  Total images   : {_baseline_count} files")
log(f"  Total size     : {_baseline_bytes / (1024**3):.2f} GB")
log("  Pillow         : OK")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 — INDEX THE ENTIRE DJANGO PROJECT
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 1 — INDEX THE ENTIRE DJANGO PROJECT")

log()
log("APP: inventory")
log("  Model: Inventory       — feature_image → FileField → upload_to=images_path_dir")
log("  Model: InventoryImage  — image         → FileField → upload_to=images_path_dir")
log("  Model: Brand           — image         → FileField → upload_to=images_path_dir")
log("  Model: Stock           — image         → FileField → upload_to=images_path_dir")
log()
log("APP: home")
log("  Model: Slider          — image         → FileField → upload_to=images_path_dir")
log("  Model: SellYourCarImages — image       → FileField → upload_to=images_path_dir")
log("  Model: PeopleTalkAboutUs — image       → FileField → upload_to=images_path_dir")
log()
log("  upload_to pattern: images/{YYYY-MM-DD}/{filename}-{YYYY-MM-DD-HH-MM-SS}.ext")

# 1.2 Scan hardcoded references
log()
log("  Scanning hardcoded image references in .html/.py/.js/.jsx/.ts/.tsx…")
static_refs = set()
_hardcoded_pattern = re.compile(
    r'''(?:src|href|url)\s*[=:(]\s*['"]([^'"]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico))['"]'''
    r'''|open\(\s*['"]([^'"]*media[^'"]+\.(?:jpg|jpeg|png|gif|webp))['"]'''
    r'''|default\s*=\s*['"]([^'"]+\.(?:jpg|jpeg|png|gif|webp))['"]''',
    re.IGNORECASE
)
_scan_extensions = {'.html', '.py', '.js', '.jsx', '.ts', '.tsx'}
_project_root = Path(PROJECT_DIR).parent

for _root, _dirs, _fnames in os.walk(_project_root):
    _dirs[:] = [d for d in _dirs if d not in {'.venv', 'venv', 'node_modules', '__pycache__', '.git', '.next'}]
    for _fn in _fnames:
        if Path(_fn).suffix.lower() in _scan_extensions:
            _fp = Path(_root) / _fn
            try:
                _text = _fp.read_text(encoding='utf-8', errors='ignore')
                for _m in _hardcoded_pattern.finditer(_text):
                    _ref = _m.group(1) or _m.group(2) or _m.group(3) or ''
                    if _ref:
                        _ref = re.sub(r'^/?media/', '', _ref.lstrip('/'))
                        static_refs.add(_ref.replace('\\', '/').strip('/'))
            except Exception:
                pass

log(f"  Static (hardcoded) references found: {len(static_refs)}")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — COLLECT ALL DB-REFERENCED IMAGE PATHS
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 2 — COLLECT ALL DB-REFERENCED IMAGE PATHS")

from django.apps import apps as django_apps

db_original_paths = set()
_total_db_refs = 0

log()
for _app, _model_name, _field in IMAGE_MODELS:
    try:
        _Model = django_apps.get_model(_app, _model_name)
        _qs = (
            _Model.objects
            .exclude(**{f'{_field}__isnull': True})
            .exclude(**{f'{_field}__exact': ''})
            .values_list(_field, flat=True)
        )
        _paths = [str(p) for p in _qs if p]
        _total_db_refs += len(_paths)
        for _p in _paths:
            _norm = _p.replace('\\', '/').strip('/')
            if _norm.startswith('media/'):
                _norm = _norm[6:]
            db_original_paths.add(_norm)
        log(f"  {_app}.{_model_name}.{_field}: {len(_paths)} records")
    except Exception as _e:
        log(f"  ERROR scanning {_app}.{_model_name}.{_field}: {_e}")

# Build WebP equivalents
db_webp_equivalents = set()
for _p in db_original_paths:
    _webp = str(Path(_p).with_suffix('.webp')).replace('\\', '/')
    db_webp_equivalents.add(_webp)

db_all_valid = db_original_paths | db_webp_equivalents

log()
log("DATABASE INDEX COMPLETE")
log("=======================")
log(f"  Total DB image references : {_total_db_refs}")
log(f"  Unique paths collected    : {len(db_original_paths)}")
log(f"  Models scanned            : {len(IMAGE_MODELS)}")
log(f"  Valid paths (orig+webp)   : {len(db_all_valid)}")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3 — SCAN ALL PHYSICAL FILES IN MEDIA_ROOT
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 3 — SCAN ALL PHYSICAL FILES IN MEDIA_ROOT")

disk_files = {}  # rel_path (fwd slashes) → {abs, size, mtime_date, ext}

for _root, _dirs, _fnames in os.walk(MEDIA_ROOT):
    _dirs[:] = [d for d in _dirs if not d.startswith('media_quarantine')]
    for _fn in _fnames:
        _fp   = Path(_root) / _fn
        _ext  = _fp.suffix.lower()
        if _ext in IMAGE_EXTENSIONS or _ext in {'.mp4', '.mov'}:
            try:
                _st  = _fp.stat()
                _rel = str(_fp.relative_to(MEDIA_ROOT)).replace('\\', '/')
                disk_files[_rel] = {
                    'abs':   _fp,
                    'size':  _st.st_size,
                    'mtime': datetime.datetime.fromtimestamp(_st.st_mtime),
                    'ext':   _ext,
                }
            except OSError:
                pass

_ext_summary = {}
for _info in disk_files.values():
    _e = _info['ext']
    _ext_summary.setdefault(_e, {'count': 0, 'bytes': 0})
    _ext_summary[_e]['count'] += 1
    _ext_summary[_e]['bytes'] += _info['size']

_total_disk_bytes = sum(v['size'] for v in disk_files.values())

log()
log("DISK SCAN COMPLETE")
log("==================")
log(f"  Total image files on disk : {len(disk_files)}")
log(f"  Total size                : {_total_disk_bytes / (1024**3):.2f} GB")
log("  By format:")
for _ext in sorted(_ext_summary.keys()):
    _c = _ext_summary[_ext]['count']
    _b = _ext_summary[_ext]['bytes']
    log(f"    {_ext:<8} → {_c:>5} files  ({_b/(1024**2):.1f} MB)")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 4 — COMPRESS AND CONVERT ALL IMAGES TO WEBP
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 4 — COMPRESS AND CONVERT ALL IMAGES TO WEBP")
log(f"  Quality=82  Method=6  Cutoff={CUTOFF_DATE}")
log()

converted_count   = 0
failed_count      = 0
skipped_count     = 0
orig_bytes_processed = 0
new_bytes_total   = 0
originals_to_delete  = []
db_updates_needed = []   # [(old_rel, new_rel)]

_file_items = sorted(disk_files.items())   # stable order

for _rel, _info in _file_items:
    _src  = _info['abs']
    _ext  = _info['ext']
    _size = _info['size']
    _mdate = _info['mtime'].date()

    # Skip video files silently
    if _ext in {'.mp4', '.mov', '.avi', '.webm'}:
        continue

    # Skip non-convertible
    if _ext in SKIP_CONVERSION:
        log(f"  ⊘ SKIPPED   : {_rel} ({_ext} — not converted)")
        skipped_count += 1
        continue

    # Already WebP
    if _ext == '.webp':
        skipped_count += 1
        continue

    # Skip recently modified files
    if _mdate > CUTOFF_DATE:
        log(f"  ⊘ RECENT    : {_rel} (modified {_mdate} — within 7 days)")
        skipped_count += 1
        continue

    _webp_rel  = str(Path(_rel).with_suffix('.webp')).replace('\\', '/')
    _webp_path = MEDIA_ROOT / _webp_rel

    # WebP already exists and is smaller → skip
    if _webp_path.exists():
        _existing = _webp_path.stat().st_size
        if _existing <= _size:
            log(f"  ⊘ EXISTS    : {_rel} → {_webp_rel} already smaller, skipping")
            skipped_count += 1
            continue

    orig_bytes_processed += _size

    try:
        # Open with Pillow
        with PilImage.open(_src) as _img:
            # Handle mode
            if _img.mode == 'P':
                _img = _img.convert('RGBA')
            elif _img.mode in ('RGBA', 'LA'):
                _img = _img.convert('RGBA')
            elif _img.mode != 'RGB':
                _img = _img.convert('RGB')

            # Save as WebP
            _webp_path.parent.mkdir(parents=True, exist_ok=True)
            _img.save(str(_webp_path), 'WEBP', quality=82, method=6)

        # Verify
        with PilImage.open(_webp_path) as _v:
            _ = _v.size  # confirms readable

        _webp_size = _webp_path.stat().st_size

        if _webp_size > _size:
            # WebP is larger — discard, keep original
            _webp_path.unlink(missing_ok=True)
            log(f"  ⊘ LARGER    : {_rel} → WebP ({_webp_size/1024:.0f}KB) > original ({_size/1024:.0f}KB) — kept original")
            new_bytes_total += _size
            skipped_count += 1
        else:
            _pct = (1 - _webp_size / _size) * 100
            log(f"  ✓ CONVERTED : {_rel} → ({_size/1024:.0f}KB → {_webp_size/1024:.0f}KB, saved {_pct:.0f}%)")
            new_bytes_total += _webp_size
            originals_to_delete.append(_src)
            converted_count += 1
            _rel_norm = _rel.replace('\\', '/').strip('/')
            if _rel_norm in db_original_paths:
                db_updates_needed.append((_rel_norm, _webp_rel))

    except Exception as _e:
        log(f"  ✗ FAILED    : {_rel} → ERROR: {_e}")
        if _webp_path.exists():
            try:
                _webp_path.unlink()
            except OSError:
                pass
        new_bytes_total += _size
        failed_count += 1

log()

# Delete originals after all conversions
_del_ok = 0
for _src_path in originals_to_delete:
    try:
        _src_path.unlink()
        _del_ok += 1
    except Exception as _e:
        log(f"  ✗ DELETE FAILED: {_src_path.name} — {_e}")

log(f"  Deleted {_del_ok} original files (verified WebP replacements exist)")

# ── Generate DB update script ────────────────────────────────────────────────
_update_script = Path(PROJECT_DIR) / 'update_image_paths.py'
with open(_update_script, 'w', encoding='utf-8') as _f:
    _f.write(
        '#!/usr/bin/env python\n'
        '"""\n'
        'Generated by media_optimizer.py\n'
        'Updates DB FileField paths from old extensions to .webp\n'
        'SAFE: only updates path strings, never modifies image files.\n'
        'Run from backend/: python update_image_paths.py\n'
        '"""\n'
        'import os, sys\n'
        'sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))\n'
        'os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")\n'
        'try:\n'
        '    from dotenv import load_dotenv\n'
        '    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))\n'
        'except ImportError:\n'
        '    pass\n'
        'import django\n'
        'django.setup()\n'
        'from django.apps import apps\n'
        'from pathlib import Path\n\n'
        '# Map of old relative path → new .webp relative path\n'
        'PATH_MAP = {\n'
    )
    for _old, _new in db_updates_needed:
        _f.write(f'    {repr(_old)}: {repr(_new)},\n')
    _f.write(
        '}\n\n'
        'IMAGE_MODELS = [\n'
        '    ("inventory", "Inventory",         "feature_image"),\n'
        '    ("inventory", "InventoryImage",    "image"),\n'
        '    ("inventory", "Brand",             "image"),\n'
        '    ("inventory", "Stock",             "image"),\n'
        '    ("home",      "Slider",            "image"),\n'
        '    ("home",      "SellYourCarImages", "image"),\n'
        '    ("home",      "PeopleTalkAboutUs", "image"),\n'
        ']\n\n'
        'total_updated = 0\n'
        'for app_label, model_name, field in IMAGE_MODELS:\n'
        '    Model = apps.get_model(app_label, model_name)\n'
        '    for old_p, new_p in PATH_MAP.items():\n'
        '        n = Model.objects.filter(**{field: old_p}).update(**{field: new_p})\n'
        '        if n:\n'
        '            print(f"  Updated {n} row(s): {model_name}.{field}: {old_p} -> {new_p}")\n'
        '            total_updated += n\n'
        '        # Also handle "media/" prefixed variants\n'
        '        n2 = Model.objects.filter(**{field: "media/" + old_p}).update(**{field: "media/" + new_p})\n'
        '        if n2:\n'
        '            print(f"  Updated {n2} row(s) (prefixed): {model_name}.{field}")\n'
        '            total_updated += n2\n'
        'print(f"\\nTotal rows updated: {total_updated}")\n'
    )

log()
log(f"  DB update script written: update_image_paths.py")
log(f"  DB fields needing .webp  update: {len(db_updates_needed)}")
log()
log("  ⚠ ACTION REQUIRED: After reviewing results, run:")
log("      python update_image_paths.py")
log("    This updates DB paths from old extensions to .webp.")
log("    SAFE — only updates path strings, never touches image files.")

_space_saved = orig_bytes_processed - new_bytes_total
_space_pct   = (_space_saved / orig_bytes_processed * 100) if orig_bytes_processed > 0 else 0

log()
log("COMPRESSION COMPLETE")
log("====================")
log(f"  Files processed        : {converted_count + failed_count + skipped_count}")
log(f"  Successfully converted : {converted_count}")
log(f"  Failed / Skipped       : {failed_count + skipped_count} (failed={failed_count}, skipped={skipped_count})")
log(f"  Original total size    : {orig_bytes_processed / (1024**3):.2f} GB")
log(f"  New total size         : {new_bytes_total / (1024**2):.0f} MB")
log(f"  Space saved            : {_space_saved / (1024**3):.2f} GB ({_space_pct:.1f}%)")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 5 — IDENTIFY ORPHANED / DEPRECATED IMAGES
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 5 — IDENTIFY ORPHANED / DEPRECATED IMAGES")

# 5.1 Rescan disk after conversions
disk_files_v2 = {}
for _root, _dirs, _fnames in os.walk(MEDIA_ROOT):
    _dirs[:] = [d for d in _dirs if not d.startswith('media_quarantine')]
    for _fn in _fnames:
        _fp  = Path(_root) / _fn
        _ext = _fp.suffix.lower()
        if _ext in IMAGE_EXTENSIONS:
            try:
                _st  = _fp.stat()
                _rel = str(_fp.relative_to(MEDIA_ROOT)).replace('\\', '/')
                disk_files_v2[_rel] = {
                    'abs':   _fp,
                    'size':  _st.st_size,
                    'mtime': datetime.datetime.fromtimestamp(_st.st_mtime),
                    'ext':   _ext,
                }
            except OSError:
                pass

# 5.2 Build orphan candidates — on disk but NOT in db_all_valid and NOT in static_refs
_db_valid_norm = {p.replace('\\', '/').strip('/') for p in db_all_valid}
_static_norm   = {p.replace('\\', '/').strip('/') for p in static_refs}

# 5.3 Filter with safety exclusions
orphaned_files = {}
for _rel, _info in disk_files_v2.items():
    _rel_norm  = _rel.replace('\\', '/').strip('/')
    _fname     = Path(_rel).name.lower()
    _parts     = set(p.lower() for p in Path(_rel).parts[:-1])  # parent dirs

    # In DB or static refs → safe
    if _rel_norm in _db_valid_norm or _rel_norm in _static_norm:
        continue

    # Safe filename prefix
    if any(_fname.startswith(_pfx) for _pfx in SAFE_FILENAME_PREFIXES):
        continue

    # Safe subdirectory
    if _parts & SAFE_SUBDIRS:
        continue

    # Modified within last 7 days → too new to quarantine
    if _info['mtime'].date() > CUTOFF_DATE:
        continue

    # Zero-byte (corrupted)
    if _info['size'] == 0:
        continue

    orphaned_files[_rel] = _info

# 5.4 Broken DB references (in DB but missing from disk)
broken_refs = []
for _p in sorted(db_original_paths):
    _abs_orig = MEDIA_ROOT / _p
    _abs_webp = MEDIA_ROOT / str(Path(_p).with_suffix('.webp')).replace('\\', '/')
    if not _abs_orig.exists() and not _abs_webp.exists():
        broken_refs.append(_p)

# 5.5 Print report
log()
log("ORPHANED FILES DETECTED")
log("=======================")
_orphan_total_bytes = 0
for _i, (_rel, _info) in enumerate(sorted(orphaned_files.items()), 1):
    _kb   = _info['size'] / 1024
    _mdt  = _info['mtime'].strftime('%Y-%m-%d')
    log(f"  [{_i:04d}] {_rel:<65} {_kb:>8.0f} KB   last modified: {_mdt}")
    _orphan_total_bytes += _info['size']

log()
log(f"  Total orphaned files : {len(orphaned_files)}")
log(f"  Total size           : {_orphan_total_bytes / (1024**2):.1f} MB")

if broken_refs:
    log()
    log("  BROKEN DB REFERENCES (file missing from disk — manual fix needed):")
    for _i, _p in enumerate(broken_refs, 1):
        log(f"    [{_i:04d}] {_p}")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 6 — QUARANTINE ORPHANED FILES
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 6 — QUARANTINE ORPHANED FILES")

QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)
log(f"  Quarantine directory: {QUARANTINE_DIR}")
log()

quarantined_count  = 0
quarantine_failed  = 0
quarantine_index   = []   # [(rel, size, mdate_str)]

for _rel, _info in sorted(orphaned_files.items()):
    _src  = _info['abs']
    _dest = QUARANTINE_DIR / _rel

    try:
        _dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(_src), str(_dest))

        if _dest.exists() and not _src.exists():
            log(f"  ✓ QUARANTINED: {_rel}")
            quarantined_count += 1
            quarantine_index.append((_rel, _info['size'], _info['mtime'].strftime('%Y-%m-%d')))
        else:
            log(f"  ✗ VERIFY FAILED: {_rel}")
            quarantine_failed += 1
    except Exception as _e:
        log(f"  ✗ MOVE FAILED  : {_rel} — {_e}")
        quarantine_failed += 1

# 6.6 Write QUARANTINE_INDEX.txt
_qidx_path = QUARANTINE_DIR / 'QUARANTINE_INDEX.txt'
with open(_qidx_path, 'w', encoding='utf-8') as _f:
    _f.write(f"Generated : {NOW.strftime('%Y-%m-%d %H:%M:%S')}\n")
    _f.write(f"Project   : BegAutos\n")
    _f.write(f"MEDIA_ROOT: {MEDIA_ROOT}\n\n")
    _f.write("FILES IN THIS QUARANTINE:\n")
    _f.write("=========================\n")
    for _i, (_rel, _sz, _mdt) in enumerate(quarantine_index, 1):
        _f.write(f"[{_i:04d}] {_rel}  ({_sz/1024:.0f} KB)  last seen: {_mdt}\n")
    _f.write("\nINSTRUCTIONS:\n")
    _f.write("Review this folder manually.\n")
    _f.write("If you confirm these are unneeded: delete the entire folder.\n")
    _f.write("If any file was wrongly quarantined: move it back to:\n")
    _f.write(f"  {MEDIA_ROOT}/<original relative path>\n")

log()
log(f"  Quarantine index written : {_qidx_path}")
log(f"  Successfully quarantined : {quarantined_count}")
if quarantine_failed:
    log(f"  Failed moves             : {quarantine_failed}")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 7 — FINAL REPORT
# ─────────────────────────────────────────────────────────────────────────────
_final_size_bytes = sum(
    f.stat().st_size
    for f in MEDIA_ROOT.rglob('*')
    if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
)
_quarantine_name  = QUARANTINE_DIR.name

log()
log("╔══════════════════════════════════════════════════════════════╗")
log("║           MEDIA OPTIMIZATION — FINAL REPORT                 ║")
log("╠══════════════════════════════════════════════════════════════╣")
log("║  COMPRESSION RESULTS                                        ║")
log("║  ─────────────────────────────────────────────────────────  ║")
log(f"║  Images converted to WebP      : {converted_count:<28} ║")
log(f"║  Images failed / skipped       : {failed_count + skipped_count:<28} ║")
log(f"║  Size before optimization      : {orig_bytes_processed/(1024**3):.2f} GB{'':<22}║")
log(f"║  Size after optimization       : {new_bytes_total/(1024**2):.0f} MB{'':<25}║")
log(f"║  Total space saved             : {_space_saved/(1024**3):.2f} GB ({_space_pct:.1f}%){'':<15}║")
log("║                                                             ║")
log("║  QUARANTINE RESULTS                                         ║")
log("║  ─────────────────────────────────────────────────────────  ║")
log(f"║  Orphaned files quarantined    : {quarantined_count:<28} ║")
log(f"║  Quarantine location           : {_quarantine_name:<28} ║")
log(f"║  Size of quarantined files     : {_orphan_total_bytes/(1024**2):.1f} MB{'':<24}║")
log("║                                                             ║")
log("║  WARNINGS                                                   ║")
log("║  ─────────────────────────────────────────────────────────  ║")
log(f"║  Broken DB references          : {len(broken_refs):<28} ║")
log(f"║  Images not converted (errors) : {failed_count:<28} ║")
log("║                                                             ║")
log("║  ACTION REQUIRED BY YOU                                     ║")
log("║  ─────────────────────────────────────────────────────────  ║")
log("║  1. Run update_image_paths.py to fix DB extension paths    ║")
log(f"║  2. Review {_quarantine_name:<49} ║")
log("║  3. Fix broken DB references listed in log                 ║")
log("║  4. Test your site — confirm all images load correctly     ║")
log("║                                                             ║")
log(f"║  Log: media_optimization_log_{TIMESTAMP}.txt              ║")
log("╚══════════════════════════════════════════════════════════════╝")

if _log_fh:
    _log_fh.close()

print(f"\nLog saved to: {LOG_FILE}")
