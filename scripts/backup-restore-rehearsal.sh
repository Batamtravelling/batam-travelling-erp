#!/usr/bin/env bash
set -euo pipefail

: "${SOURCE_DATABASE_URL:?SOURCE_DATABASE_URL wajib diisi}"
: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL wajib menunjuk database staging/ephemeral, bukan production}"
: "${RESTORE_DATABASE_LABEL:?RESTORE_DATABASE_LABEL wajib diisi dengan nama target staging/ephemeral}"

if [[ "${ALLOW_RESTORE_REHEARSAL:-false}" != "true" ]]; then
  echo "Set ALLOW_RESTORE_REHEARSAL=true hanya setelah target restore diverifikasi." >&2
  exit 1
fi

if [[ "$RESTORE_DATABASE_LABEL" =~ [Pp][Rr][Oo][Dd] ]]; then
  echo "RESTORE_DATABASE_LABEL tidak boleh menunjuk production." >&2
  exit 1
fi

if [[ "$SOURCE_DATABASE_URL" == "$RESTORE_DATABASE_URL" ]]; then
  echo "Database restore tidak boleh sama dengan source." >&2
  exit 1
fi

backup_dir="${BACKUP_DIR:-./backups/rehearsal}"
mkdir -p "$backup_dir"
backup_file="$backup_dir/erp-$(date -u +%Y%m%dT%H%M%SZ).dump"

pg_dump --format=custom --no-owner --no-acl --file="$backup_file" "$SOURCE_DATABASE_URL"
pg_restore --clean --if-exists --no-owner --no-acl --dbname="$RESTORE_DATABASE_URL" "$backup_file"
psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -c "select count(*) as migration_count from _prisma_migrations; select count(*) as tenant_count from tenants; select count(*) as booking_count from bookings; select count(*) as payment_count from payments;"
echo "Backup dan restore rehearsal berhasil: $backup_file"
