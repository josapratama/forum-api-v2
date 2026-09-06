# ============================================================
# Forum API - Setup PostgreSQL via Docker and Run All Tests
# ============================================================

$ErrorActionPreference = "Stop"
$ProjectDir = $PSScriptRoot

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Forum API - Docker Setup & Test Runner" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ProjectDir

# ----- 0. Wait for Docker daemon to be ready -----
Write-Host "[0/4] Checking Docker daemon..." -ForegroundColor Yellow
$dockerReady = $false
for ($i = 0; $i -lt 12; $i++) {
    $result = docker info --format "{{.ServerVersion}}" 2>$null
    if ($LASTEXITCODE -eq 0 -and $result) {
        Write-Host "      Docker daemon ready (v$result)." -ForegroundColor Green
        $dockerReady = $true
        break
    }
    Write-Host "      Waiting for Docker daemon... ($($i*5)s)" -ForegroundColor Gray
    Start-Sleep -Seconds 5
}
if (-not $dockerReady) {
    Write-Host "[ERROR] Docker daemon not available. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host ""

# ----- 1. Start Docker Compose -----
Write-Host "[1/4] Starting PostgreSQL via Docker Compose..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] docker compose up failed." -ForegroundColor Red
    exit 1
}
Write-Host "      Container started. Waiting for PostgreSQL to be healthy..." -ForegroundColor Gray

$maxWait = 90
$waited = 0
$healthy = $false
do {
    Start-Sleep -Seconds 3
    $waited += 3
    $health = docker inspect forum-api-postgres --format "{{.State.Health.Status}}" 2>$null
    Write-Host "      ... status: $health (${waited}s elapsed)" -ForegroundColor Gray
    if ($health -eq "healthy") {
        $healthy = $true
        break
    }
    if ($waited -ge $maxWait) { break }
} while ($true)

if (-not $healthy) {
    Write-Host "[ERROR] PostgreSQL did not become healthy within $maxWait seconds." -ForegroundColor Red
    docker logs forum-api-postgres --tail 20
    exit 1
}
Write-Host "      PostgreSQL is healthy!" -ForegroundColor Green
Write-Host ""

# ----- 2. Run migrations on production DB -----
Write-Host "[2/4] Running migrations on 'forumapi' (production)..." -ForegroundColor Yellow
$env:PGHOST     = "localhost"
$env:PGPORT     = "5432"
$env:PGUSER     = "developer"
$env:PGPASSWORD = "supersecretpassword"
$env:PGDATABASE = "forumapi"

node node_modules/node-pg-migrate/bin/node-pg-migrate.js up
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Migration on 'forumapi' failed." -ForegroundColor Red
    exit 1
}
Write-Host "      Migrations applied to 'forumapi'." -ForegroundColor Green
Write-Host ""

# ----- 3. Run migrations on test DB -----
Write-Host "[3/4] Running migrations on 'forumapi_test' (test)..." -ForegroundColor Yellow
$env:PGDATABASE = "forumapi_test"

node node_modules/node-pg-migrate/bin/node-pg-migrate.js up
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Migration on 'forumapi_test' failed." -ForegroundColor Red
    exit 1
}
Write-Host "      Migrations applied to 'forumapi_test'." -ForegroundColor Green
Write-Host ""

# ----- 4. Run all tests with coverage -----
Write-Host "[4/4] Running all tests with coverage..." -ForegroundColor Yellow
$env:NODE_ENV   = "test"
$env:PGDATABASE = "forumapi_test"

node --experimental-vm-modules node_modules/vitest/vitest.mjs --run --coverage
$testExit = $LASTEXITCODE

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
if ($testExit -eq 0) {
    Write-Host "  All tests PASSED!" -ForegroundColor Green
} else {
    Write-Host "  Some tests FAILED (exit code: $testExit)" -ForegroundColor Red
}
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Useful commands:" -ForegroundColor Gray
Write-Host "    Stop PostgreSQL  : docker compose down" -ForegroundColor Gray
Write-Host "    Start the API    : npm start" -ForegroundColor Gray
Write-Host "    Run tests only   : npm test" -ForegroundColor Gray
Write-Host "    Run with coverage: npm run test:coverage" -ForegroundColor Gray
Write-Host ""

exit $testExit
