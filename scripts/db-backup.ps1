param(
    [string]$BackupDir = $env:BACKUP_DIR
)

$ErrorActionPreference = 'Stop'

if (-not $env:DATABASE_URL) {
    Write-Error 'DATABASE_URL is required.'
    exit 1
}

if (-not $BackupDir) {
    $BackupDir = Join-Path (Get-Location) 'var\backups'
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupFile = Join-Path $BackupDir "orgcentral-$timestamp.dump"

Write-Host "Starting backup to $backupFile"

& pg_dump $env:DATABASE_URL --format=custom --file=$backupFile
if ($LASTEXITCODE -ne 0) {
    Write-Error 'Backup failed.'
    exit 1
}

Write-Host 'Backup completed successfully.'
