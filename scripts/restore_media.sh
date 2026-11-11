#!/usr/bin/env bash
set -euo pipefail

# Safely restore media archive into the running backend container's media volume.
# Expected invocation:
#   sudo bash scripts/restore_media.sh /home/deploy/media_missing.zip

usage() {
    echo "Usage: $0 <path-to-media-zip>" >&2
}

if [ "$#" -ne 1 ] || [ -z "${1:-}" ]; then
    echo "[ERROR] Missing zip file path argument." >&2
    usage
    exit 1
fi

RAW_ZIP_PATH="$1"
if [ ! -f "$RAW_ZIP_PATH" ]; then
    echo "[ERROR] Zip file not found: $RAW_ZIP_PATH" >&2
    exit 1
fi
if [ ! -s "$RAW_ZIP_PATH" ]; then
    echo "[ERROR] Zip file is empty: $RAW_ZIP_PATH" >&2
    exit 1
fi

ZIP_DIR="$(cd "$(dirname "$RAW_ZIP_PATH")" && pwd)"
ZIP_PATH="${ZIP_DIR}/$(basename "$RAW_ZIP_PATH")"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

if [ ! -f .env.production ]; then
    echo "[ERROR] .env.production is missing in $REPO_DIR!" >&2
    exit 1
fi

COMPOSE=(docker compose --env-file .env.production)

if ! "${COMPOSE[@]}" ps --services --filter "status=running" | grep -q "^backend$"; then
    echo "[ERROR] Backend container is not running! Cannot restore media." >&2
    exit 1
fi

TMP_ZIP="/tmp/restore_media_$$.zip"
CLEANED=0

cleanup() {
    if [ "$CLEANED" -eq 0 ]; then
        "${COMPOSE[@]}" exec -T backend rm -f "$TMP_ZIP" >/dev/null 2>&1 || true
        CLEANED=1
    fi
}
trap cleanup EXIT

echo "[*] Copying archive into running backend container ($TMP_ZIP)..."
"${COMPOSE[@]}" cp "$ZIP_PATH" "backend:${TMP_ZIP}"

echo "[*] Listing and verifying zip contents inside backend container..."
"${COMPOSE[@]}" exec -T backend python -m zipfile -l "$TMP_ZIP"
"${COMPOSE[@]}" exec -T backend python -m zipfile -t "$TMP_ZIP"

echo "[*] Extracting archive into /app/media_root/media..."
"${COMPOSE[@]}" exec -T backend mkdir -p /app/media_root/media
"${COMPOSE[@]}" exec -T backend python -m zipfile -e "$TMP_ZIP" /app/media_root/media
"${COMPOSE[@]}" exec -T backend chmod -R a+rX /app/media_root/media

echo "[*] Removing temporary archive from backend container..."
"${COMPOSE[@]}" exec -T backend rm -f "$TMP_ZIP"
CLEANED=1

echo "[*] Verifying /app/media_root/media/site contents:"
"${COMPOSE[@]}" exec -T backend ls -l /app/media_root/media/site

echo "[*] Media restore completed successfully."
