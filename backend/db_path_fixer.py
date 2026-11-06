#!/usr/bin/env python
"""
DB Path Fixer — BegAutos
========================
Updates every database FileField/ImageField record that still stores a path
ending in .jpg/.jpeg/.png/.bmp/.tiff/.tif/.ico where the corresponding .webp
file now exists on disk.

Usage:
  python db_path_fixer.py            → Phases 0-3 (dry run only, then stop)
  python db_path_fixer.py --confirm  → Phases 0-5 (dry run + execute + report)

ABSOLUTE CONSTRAINTS:
  - NEVER update a record if its .webp does NOT exist on disk
  - NEVER touch records already ending in .webp
  - NEVER touch .svg or .gif values
  - NEVER auto-proceed past dry run without --confirm
"""

import os
import sys
import random
import datetime
from pathlib import Path

# ─── Django Setup ─────────────────────────────────────────────────────────────
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
from django.apps import apps as django_apps

# ─── Config ───────────────────────────────────────────────────────────────────
CONFIRM_MODE  = '--confirm' in sys.argv
MEDIA_ROOT    = Path(settings.MEDIA_ROOT)
NOW           = datetime.datetime.now()
TIMESTAMP     = NOW.strftime('%Y-%m-%d_%H-%M')
LOG_FILE      = Path(PROJECT_DIR) / f"db_path_fix_log_{TIMESTAMP}.txt"

# Extensions that trigger a conversion check
OLD_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.ico'}
# Extensions never touched
EXEMPT_EXTENSIONS = {'.svg', '.gif'}

# ─── Model–field pairs to scan ────────────────────────────────────────────────
# Each entry: (app_label, model_name, field_name, friendly_upload_to)
IMAGE_MODEL_FIELDS = [
    ('inventory', 'Inventory',        'feature_image', 'images_path_dir → images/{date}/'),
    ('inventory', 'InventoryImage',   'image',         'images_path_dir → images/{date}/'),
    ('inventory', 'Brand',            'image',         'images_path_dir → images/{date}/'),
    ('inventory', 'Stock',            'image',         'images_path_dir → images/{date}/'),
    ('home',      'Slider',           'image',         'images_path_dir → images/{date}/'),
    ('home',      'SellYourCarImages','image',         'images_path_dir → images/{date}/'),
    ('home',      'PeopleTalkAboutUs','image',         'images_path_dir → images/{date}/'),
]

# ─── Logger ───────────────────────────────────────────────────────────────────
_log_fh = None

def _open_log():
    global _log_fh
    _log_fh = open(LOG_FILE, 'w', encoding='utf-8')
    _log_fh.write(f"DB PATH FIXER LOG — {NOW.strftime('%Y-%m-%d %H:%M:%S')}\n")
    _log_fh.write("=" * 65 + "\n\n")

def log(msg='', also_print=True):
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
# PHASE 0 — PRE-FLIGHT SETUP
# ─────────────────────────────────────────────────────────────────────────────
_open_log()

section("PHASE 0 — PRE-FLIGHT SETUP")

# Extract DB config
_db_cfg   = settings.DATABASES.get('default', {})
_db_engine = _db_cfg.get('ENGINE', 'unknown').split('.')[-1]
_db_name   = _db_cfg.get('NAME', 'unknown')
_db_host   = _db_cfg.get('HOST', 'localhost (sqlite)')
_db_port   = _db_cfg.get('PORT', '')

log()
log("PRE-FLIGHT OK")
log("=============")
log(f"  MEDIA_ROOT : {MEDIA_ROOT}")
log(f"  Database   : {_db_engine} — {_db_name}")
if _db_host and _db_host != 'localhost (sqlite)':
    log(f"  DB Host    : {_db_host}{':' + str(_db_port) if _db_port else ''}")
log(f"  Log file   : {LOG_FILE}")
log(f"  Mode       : {'DRY RUN + EXECUTE (--confirm)' if CONFIRM_MODE else 'DRY RUN ONLY'}")
log()
log("  Starting scan — NO database writes yet.")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 — INDEX ALL IMAGE FIELDS
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 1 — INDEX ALL IMAGE FIELDS ACROSS ALL MODELS")
log()
log("MODEL INDEX")
log("===========")

valid_pairs = []
for _i, (_app, _model_name, _field, _upload) in enumerate(IMAGE_MODEL_FIELDS, 1):
    try:
        _Model = django_apps.get_model(_app, _model_name)
        # Confirm field exists
        _Model._meta.get_field(_field)
        valid_pairs.append((_app, _model_name, _field, _upload, _Model))
        _label = f"{_app}.{_model_name}"
        log(f"  [{_i:02d}] {_label:<30} → field: {_field:<15} upload_to: {_upload}")
    except Exception as _e:
        log(f"  [{_i:02d}] ERROR loading {_app}.{_model_name}.{_field}: {_e}")

log()
log(f"  Total: {len(valid_pairs)} model-field pairs found.")

if not valid_pairs:
    log()
    log("No ImageField or FileField found in project. Exiting.")
    if _log_fh:
        _log_fh.close()
    sys.exit(0)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — SCAN EACH MODEL FIELD AND CLASSIFY EVERY DB VALUE
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 2 — SCAN EACH MODEL FIELD AND CLASSIFY EVERY DB VALUE")

# master_update_list: all records classified as NEEDS_UPDATE
master_update_list = []

# Aggregated stats across all fields
agg_stats = {
    'total':           0,
    'already_updated': 0,
    'needs_update':    0,
    'no_webp_found':   0,
    'both_exist':      0,
    'both_missing':    0,
    'empty':           0,
    'exempt':          0,
}

# Per-field stats for report
field_stats = {}   # key: "app.Model.field" → dict of counts
field_no_webp = {} # key: "app.Model.field" → count
field_broken  = {} # key: "app.Model.field" → count

for (_app, _model_name, _field, _upload, _Model) in valid_pairs:
    _key = f"{_app}.{_model_name}.{_field}"
    log()
    log(f"  Scanning {_key} …")

    _stats = {
        'total':           0,
        'already_updated': 0,
        'needs_update':    0,
        'no_webp_found':   0,
        'both_exist':      0,
        'both_missing':    0,
        'empty':           0,
        'exempt':          0,
    }

    try:
        _qs = (
            _Model.objects
            .exclude(**{f'{_field}__isnull': True})
            .exclude(**{f'{_field}__exact':  ''})
            .values('pk', _field)
        )
        _records = list(_qs)
    except Exception as _e:
        log(f"    ERROR querying {_key}: {_e}")
        continue

    for _rec in _records:
        _pk        = _rec['pk']
        _raw_value = str(_rec[_field] or '').strip()
        _stats['total'] += 1

        if not _raw_value:
            _stats['empty'] += 1
            continue

        # Normalise: strip leading slashes and "media/" prefix
        _norm = _raw_value.replace('\\', '/').strip('/')
        if _norm.startswith('media/'):
            _norm = _norm[6:]

        _ext = Path(_norm).suffix.lower()

        # CASE C — empty (already handled above, but belt-and-suspenders)
        if not _ext:
            _stats['empty'] += 1
            continue

        # CASE A — already .webp
        if _ext == '.webp':
            _stats['already_updated'] += 1
            continue

        # CASE D — exempt (.svg / .gif)
        if _ext in EXEMPT_EXTENSIONS:
            _stats['exempt'] += 1
            continue

        # CASE B — old extension that could have been converted
        if _ext in OLD_EXTENSIONS:
            _webp_norm = str(Path(_norm).with_suffix('.webp')).replace('\\', '/')
            _abs_new   = MEDIA_ROOT / _webp_norm
            _abs_old   = MEDIA_ROOT / _norm

            _webp_exists = _abs_new.exists()
            _old_exists  = _abs_old.exists()

            if _webp_exists and _old_exists:
                # BOTH_EXIST → update to webp, but note the duplicate
                _stats['needs_update'] += 1
                _stats['both_exist']   += 1
                log(f"    BOTH_EXIST  pk={_pk}: {_norm} (will update to .webp, old file still present)")
                master_update_list.append({
                    'app':       _app,
                    'model':     _model_name,
                    'field':     _field,
                    'Model':     _Model,
                    'pk':        _pk,
                    'old_value': _raw_value,   # store original to use in update
                    'new_value': _raw_value.replace('\\', '/').rstrip('/').rsplit('.', 1)[0] + '.webp'
                                 if '.' in _raw_value else _raw_value,
                })
            elif _webp_exists and not _old_exists:
                # Normal NEEDS_UPDATE
                _stats['needs_update'] += 1
                # Build new_value preserving any leading prefix the DB uses
                _new_val = _raw_value.replace('\\', '/')
                _new_val = _new_val.rsplit('.', 1)[0] + '.webp'
                master_update_list.append({
                    'app':       _app,
                    'model':     _model_name,
                    'field':     _field,
                    'Model':     _Model,
                    'pk':        _pk,
                    'old_value': _raw_value,
                    'new_value': _new_val,
                })
            elif not _webp_exists and not _old_exists:
                # BOTH_MISSING — broken reference
                _stats['both_missing'] += 1
                log(f"    BOTH_MISSING pk={_pk}: {_norm} — neither file on disk!")
            else:
                # NO_WEBP_FOUND — original still exists, not converted yet
                _stats['no_webp_found'] += 1
        else:
            # Unknown extension — skip
            _stats['empty'] += 1

    # Accumulate
    for _k in agg_stats:
        agg_stats[_k] += _stats[_k]

    field_stats[_key]   = _stats
    field_no_webp[_key] = _stats['no_webp_found']
    field_broken[_key]  = _stats['both_missing']

    # Per-field summary
    log()
    log(f"  {_key}")
    log(f"  {'─' * len(_key)}")
    log(f"  Total records scanned   : {_stats['total']:,}")
    log(f"  ALREADY_UPDATED (.webp) : {_stats['already_updated']:,}")
    log(f"  NEEDS_UPDATE            : {_stats['needs_update']:,}   ← will be fixed")
    log(f"  NO_WEBP_FOUND           : {_stats['no_webp_found']:,}   ← original unchanged, skip")
    log(f"  BOTH_EXIST (duplicate)  : {_stats['both_exist']:,}   ← webp found, old still there, will update DB")
    log(f"  BOTH_MISSING (broken)   : {_stats['both_missing']:,}   ← neither file exists, manual fix needed")
    log(f"  EMPTY / NULL            : {_stats['empty']:,}")
    log(f"  EXEMPT (.svg/.gif)      : {_stats['exempt']:,}")

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3 — DRY RUN PREVIEW
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 3 — DRY RUN PREVIEW (NO WRITES YET)")

log()
log("=" * 64)
log("  DRY RUN — PREVIEW OF PLANNED DB UPDATES")
log("=" * 64)
log()

# Group master_update_list by model-field for ordered display
_grouped = {}
for _entry in master_update_list:
    _k = f"{_entry['app']}.{_entry['model']}.{_entry['field']}"
    _grouped.setdefault(_k, []).append(_entry)

_preview_count = 0
for _mf_key in sorted(_grouped.keys()):
    _entries = _grouped[_mf_key]
    log(f"  ── {_mf_key} ({len(_entries)} records) ──")
    # Show first 15 and last 5 to keep output manageable
    _show = _entries[:15] + (_entries[-5:] if len(_entries) > 20 else [])
    _shown_pks = set()
    for _e in _show:
        if _e['pk'] in _shown_pks:
            continue
        _shown_pks.add(_e['pk'])
        _preview_count += 1
        _webp_abs = MEDIA_ROOT / _e['new_value'].lstrip('/').replace('media/', '', 1)
        _disk_ok  = '✓ webp exists' if _webp_abs.exists() else '✗ MISSING!'
        log(f"  [{_preview_count:04d}] pk={_e['pk']:<6}  {_e['old_value']}")
        log(f"         →  {_e['new_value']}  {_disk_ok}")
    if len(_entries) > 20:
        _skipped = len(_entries) - 20
        log(f"         … {_skipped} more records (see log for full list)")
    log()

# Full list to log (not printed to console)
log("  FULL UPDATE LIST (logged only):", also_print=False)
for _i, _e in enumerate(master_update_list, 1):
    log(f"  [{_i:05d}] {_e['app']}.{_e['model']}.{_e['field']} pk={_e['pk']}  "
        f"{_e['old_value']} → {_e['new_value']}", also_print=False)

log()
log("=" * 64)
log("  SUMMARY")
log("=" * 64)
log()
log(f"  Total records to update     : {len(master_update_list):,}")
log()
log("  Breakdown by model-field:")
for _mf_key, _entries in sorted(_grouped.items()):
    log(f"    {_mf_key:<45} : {len(_entries):,} records")

log()
log("  SKIPPED — NO_WEBP_FOUND (original file unchanged, DB left as-is):")
_any_no_webp = False
for _mf_key, _cnt in sorted(field_no_webp.items()):
    if _cnt > 0:
        log(f"    {_mf_key:<45} : {_cnt:,} records  (webp not found on disk)")
        _any_no_webp = True
if not _any_no_webp:
    log("    (none)")

log()
log("  SKIPPED — BROKEN REFERENCES (neither old nor new file on disk):")
_any_broken = False
for _mf_key, _cnt in sorted(field_broken.items()):
    if _cnt > 0:
        log(f"    {_mf_key:<45} : {_cnt:,} records   ← MANUAL FIX NEEDED")
        _any_broken = True
if not _any_broken:
    log("    (none — all referenced files accounted for)")

log()
log("  SKIPPED — EXEMPT (.svg / .gif):")
_any_exempt = False
for _mf_key, _s in sorted(field_stats.items()):
    if _s['exempt'] > 0:
        log(f"    {_mf_key:<45} : {_s['exempt']:,} records")
        _any_exempt = True
if not _any_exempt:
    log("    (none)")

log()
log("=" * 64)
log("  ⚠  NO DATABASE CHANGES HAVE BEEN MADE YET.")
log("  ⚠  Review the above. If correct, re-run with:  --confirm")
log("=" * 64)

# GATE: if --confirm not passed, stop here
if not CONFIRM_MODE:
    log()
    log("  Dry run complete. Exiting without any DB writes.")
    log(f"  Full log saved to: {LOG_FILE}")
    if _log_fh:
        _log_fh.close()
    sys.exit(0)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 4 — EXECUTE DATABASE UPDATES (--confirm mode)
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 4 — EXECUTING DATABASE UPDATES")
log()
log(f"  Proceeding with {len(master_update_list):,} updates across {len(_grouped)} model-fields…")
log()

BATCH_SIZE     = 100
total_updated  = 0
total_failed   = 0
failed_records = []

for _mf_key, _entries in sorted(_grouped.items()):
    _app, _model_name, _field = _mf_key.split('.')
    _Model = django_apps.get_model(_app, _model_name)
    _total_for_field = len(_entries)
    _updated_for_field = 0

    log(f"  ─── Processing {_mf_key} ({_total_for_field} records) ───")

    # Work in batches
    for _batch_start in range(0, _total_for_field, BATCH_SIZE):
        _batch = _entries[_batch_start: _batch_start + BATCH_SIZE]
        _batch_end = _batch_start + len(_batch)

        _objects_to_update = []
        _batch_failed = []

        for _entry in _batch:
            try:
                _instance = _Model.objects.get(pk=_entry['pk'])
                # Safety guard: only update if current value matches old_value
                _current = str(getattr(_instance, _field) or '').replace('\\', '/')
                _expected_old = _entry['old_value'].replace('\\', '/')
                if _current != _expected_old:
                    log(f"    SKIP pk={_entry['pk']}: current value changed "
                        f"('{_current}' ≠ '{_expected_old}') — skipping")
                    continue

                # One more disk check before writing
                _webp_abs = MEDIA_ROOT / _entry['new_value'].replace('\\', '/').lstrip('/').replace('media/', '', 1)
                if not _webp_abs.exists():
                    log(f"    ABORT pk={_entry['pk']}: webp file disappeared from disk! Skipping.")
                    _batch_failed.append(_entry)
                    continue

                setattr(_instance, _field, _entry['new_value'])
                _objects_to_update.append(_instance)

            except Exception as _e:
                log(f"    ERROR pk={_entry['pk']}: {_e}")
                _batch_failed.append(_entry)

        # Bulk update
        if _objects_to_update:
            try:
                _Model.objects.bulk_update(_objects_to_update, [_field])
                _n = len(_objects_to_update)
                _updated_for_field += _n
                total_updated += _n
                log(f"    BATCH WRITTEN: {_mf_key} — records "
                    f"{_batch_start + 1}–{_batch_end} of {_total_for_field} — OK ({_n} written)")
            except Exception as _e:
                log(f"    BATCH ERROR: {_mf_key} records {_batch_start+1}–{_batch_end}: {_e}")
                for _obj in _objects_to_update:
                    _batch_failed.append({'pk': _obj.pk, 'error': str(_e)})
                total_failed += len(_objects_to_update)

        failed_records.extend(_batch_failed)
        total_failed += len(_batch_failed)

    log(f"  FIELD DONE: {_mf_key} — {_updated_for_field} updated")

    # ── Step 4.4 VERIFICATION ─────────────────────────────────────────────────
    log()
    log(f"  VERIFICATION — {_mf_key}")
    log(f"  {'─' * (16 + len(_mf_key))}")

    # Pick up to 10 random pks from this field's updates
    _updated_entries = [e for e in _entries if e['pk'] not in {f.get('pk') for f in failed_records}]
    _sample = random.sample(_updated_entries, min(10, len(_updated_entries)))
    _all_ok = True

    for _s in _sample:
        try:
            _inst = _Model.objects.get(pk=_s['pk'])
            _val  = str(getattr(_inst, _field) or '')
            _ext_ok  = _val.endswith('.webp')
            _webp_path = MEDIA_ROOT / _val.replace('\\', '/').lstrip('/').replace('media/', '', 1)
            _file_ok = _webp_path.exists()
            _status  = '✓ EXISTS' if (_ext_ok and _file_ok) else '✗ PROBLEM!'
            if not (_ext_ok and _file_ok):
                _all_ok = False
            log(f"  Sample pk={_s['pk']:<6} : {_val}  → file on disk: {_status}")
        except Exception as _e:
            log(f"  Sample pk={_s['pk']}: ERROR — {_e}")
            _all_ok = False

    if _all_ok:
        log("  Verification passed ✓")
    else:
        log("  ⚠ Verification found issues — check log!")
    log()

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 5 — FINAL REPORT
# ─────────────────────────────────────────────────────────────────────────────
section("PHASE 5 — FINAL REPORT")

log()
log("╔══════════════════════════════════════════════════════════════╗")
log("║         DATABASE PATH MIGRATION — FINAL REPORT              ║")
log("╠══════════════════════════════════════════════════════════════╣")
log("║                                                             ║")
log("║  UPDATES COMPLETED                                          ║")
log(f"║  Total records updated     : {total_updated:<31}║")
log("║  Breakdown:                                                 ║")
for _mf_key, _entries in sorted(_grouped.items()):
    _done = len([e for e in _entries if e['pk'] not in {f.get('pk') for f in failed_records}])
    _short = _mf_key
    log(f"║    {_short:<44}: {_done:<7}                    ║")
log("║                                                             ║")
log("║  SKIPPED (correct — no action needed)                       ║")
log(f"║    Already .webp in DB     : {agg_stats['already_updated']:<7} records                    ║")
log(f"║    No webp on disk yet     : {agg_stats['no_webp_found']:<7} records  (original kept)     ║")
log(f"║    Exempt (.svg/.gif)      : {agg_stats['exempt']:<7} records                    ║")
log("║                                                             ║")
log("║  ERRORS — MANUAL ACTION REQUIRED                            ║")
log(f"║    Failed updates          : {total_failed:<7} records  (see log)         ║")
log(f"║    Broken references       : {agg_stats['both_missing']:<7} records  (see log)         ║")
log("║                                                             ║")
log(f"║  Log saved to: {str(LOG_FILE.name):<47}║")
log("║                                                             ║")
log("║  NEXT STEPS FOR YOU:                                        ║")
log("║  1. Run Django dev server and spot-check image URLs        ║")
log("║  2. Open broken references in Django admin and fix them    ║")
log("║  3. Run: python manage.py check — ensure no errors        ║")
log("║  4. Clear any image caches if used (thumbnail, imagekit)  ║")
log("╚══════════════════════════════════════════════════════════════╝")

if failed_records:
    log()
    log("FAILED RECORDS (manual fix needed):")
    for _fr in failed_records:
        log(f"  pk={_fr.get('pk', '?')}  error={_fr.get('error', 'see above')}")

if _log_fh:
    _log_fh.close()

print(f"\nLog saved to: {LOG_FILE}")
