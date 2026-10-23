#!/usr/bin/env bash
# Dump the Postgres DB (compose) and keep the last N backups.
set -euo pipefail
DEST="${BACKUP_DIR:-/var/backups/shopstream}"; KEEP="${KEEP:-7}"
mkdir -p "$DEST"
FILE="$DEST/shop-$(date +%Y%m%d-%H%M%S).sql.gz"
docker exec "$(docker ps -qf name=db)" pg_dump -U shop shop | gzip > "$FILE"
echo "Backup written: $FILE"
ls -1t "$DEST"/shop-*.sql.gz | tail -n +$((KEEP+1)) | xargs -r rm -f
