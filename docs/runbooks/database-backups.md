# Database Backup Runbook

## Purpose
Provide ISO 27001–aligned backup guidance for the OrgCentral PostgreSQL database.

## Scope
- Applies to all environments (dev/staging/prod)
- Covers full logical backups using `pg_dump`

## Prerequisites
- PostgreSQL client tools installed (`pg_dump`)
- Environment variables configured:
  - `DATABASE_URL`
  - `BACKUP_DIR` (optional; default: `./var/backups`)

## Backup Procedure
1. Ensure no active schema migrations are running.
2. Run the backup script for your OS:
   - Windows PowerShell: `scripts/db-backup.ps1`
   - Bash: `scripts/db-backup.sh`
3. Verify checksum and file size.
4. Store backups in a secure location with least-privilege access.

## Retention Policy
- Daily backups retained for 14 days
- Weekly backups retained for 8 weeks
- Monthly backups retained for 12 months

## Restore Validation
- Weekly: restore to a non-production environment and run smoke tests.
- Log evidence of restore success in the audit system.

## Security Considerations
- Backups contain sensitive data. Encrypt at rest.
- Do not store backups in public buckets.
- Access to backups must be audited.

## Incident Response
- If a backup fails, raise a security event with severity `high`.
- Notify escalation contacts when consecutive failures exceed 2.
