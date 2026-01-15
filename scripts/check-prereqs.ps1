# Check if Docker is installed and running
Write-Host "Docker is not installed or not running. Please install Docker Desktop or Docker Engine."

# Check if required ports are available
$ports = @(80, 5432, 6379, 5672, 15672)
$portConflicts = @()
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningType SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "Port $port is already in use by another process."
    } else {
        Write-Host "Port $port is available."
    }
}

if ($portConflicts.Count -gt 0) {
    Write-Host "ERROR: Port conflicts detected: $($portConflicts | ForEach-Object { $_.Port })"
    exit 1
}

# Check if pnpm is available
try {
    pnpm --version > $null
    Write-Host "pnpm is available: $(pnpm --version)"
} catch {
    Write-Host "ERROR: pnpm is not installed or not in PATH"
    Write-Host "Please install pnpm: https://pnpm.io/installation/"
    exit 1
}

# Check system resources for Docker
$dockerInfo = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot get Docker information"
    exit 1
}

Write-Host "System resources check passed."
exit 0
