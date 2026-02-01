#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./var/backups}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="$BACKUP_DIR/orgcentral-$TIMESTAMP.dump"

echo "Starting backup to $BACKUP_FILE"

pg_dump "$DATABASE_URL" --format=custom --file="$BACKUP_FILE"

echo "Backup completed successfully."
