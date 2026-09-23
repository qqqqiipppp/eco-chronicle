# Optional recovery only. This script was NOT run during the audit.
# powershell -File docs/asset-audit/restore.ps1
$ErrorActionPreference = 'Stop'
$auditRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$auditAssets = [IO.Path]::GetFullPath((Join-Path $auditRoot 'assets')) + [IO.Path]::DirectorySeparatorChar
$auditQuarantine = [IO.Path]::GetFullPath((Join-Path $auditRoot '_unused_assets')) + [IO.Path]::DirectorySeparatorChar
$auditReceipt = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'quarantine-manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$auditOperations = foreach ($auditEntry in $auditReceipt.files) {
    $auditFrom = [IO.Path]::GetFullPath((Join-Path $auditRoot $auditEntry.destination))
    $auditTo = [IO.Path]::GetFullPath((Join-Path $auditRoot $auditEntry.path))
    if (-not $auditFrom.StartsWith($auditQuarantine, [StringComparison]::OrdinalIgnoreCase) -or
        -not $auditTo.StartsWith($auditAssets, [StringComparison]::OrdinalIgnoreCase)) { throw 'Path escapes project asset roots.' }
    if (Test-Path -LiteralPath $auditTo) { throw "Destination already exists: $auditTo" }
    if ((Get-FileHash -LiteralPath $auditFrom -Algorithm SHA256).Hash -ne $auditEntry.sha256) { throw "Hash mismatch: $auditFrom" }
    [PSCustomObject]@{ From = $auditFrom; To = $auditTo }
}
# Every path, hash and collision is checked before any move.
foreach ($auditOperation in $auditOperations) {
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($auditOperation.To)) | Out-Null
    Move-Item -LiteralPath $auditOperation.From -Destination $auditOperation.To
}
Write-Output "Restored $($auditOperations.Count) files. No files were deleted."
