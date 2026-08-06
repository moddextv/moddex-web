#!/bin/sh
# nightly mariadb dump, 14 days retained.
#
# runs as a long-lived container (see the `backup` service in compose.prod.yaml)
# rather than a host cron, so backups travel with the stack.

set -eu

BACKUP_DIR=/backups
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14}
INTERVAL=${BACKUP_INTERVAL_SECONDS:-86400}

mkdir -p "$BACKUP_DIR"

while true; do
  STAMP=$(date +%Y-%m-%d_%H-%M-%S)
  TARGET="$BACKUP_DIR/${DB_NAME}_${STAMP}.sql.gz"

  echo "[backup] dumping ${DB_NAME} -> ${TARGET}"

  if mariadb-dump \
      --host="${DB_HOST:-db}" \
      --user="${DB_USER}" \
      --password="${DB_PASS}" \
      --single-transaction \
      --quick \
      --routines \
      --events \
      "${DB_NAME}" | gzip > "$TARGET"; then
    echo "[backup] ok ($(du -h "$TARGET" | cut -f1))"
  else
    echo "[backup] FAILED" >&2
    rm -f "$TARGET"
  fi

  find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete

  sleep "$INTERVAL"
done
