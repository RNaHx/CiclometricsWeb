# Script para iniciar CicloMetrics Web localmente
$nodeDir = "$env:LOCALAPPDATA\Programs\nodejs"
if (Test-Path $nodeDir -and ($env:PATH -notlike "*$nodeDir*")) {
    $env:PATH = "$nodeDir;" + $env:PATH
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       🚴 INICIANDO CICLOMETRICS WEB (HOST LOCAL)       " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path "frontend\dist\index.html")) {
    Write-Host "[1/3] Compilando frontend para producción local..." -ForegroundColor Gray
    npm run build --prefix frontend
} else {
    Write-Host "[1/3] Frontend compilado detectado." -ForegroundColor Green
}

Write-Host "[2/3] Abriendo navegador en http://localhost:5000 ..." -ForegroundColor Cyan
Start-Process "http://localhost:5000"

Write-Host "[3/3] Iniciando servidor Express..." -ForegroundColor Green
Write-Host "Presiona Ctrl + C para detener el servidor local.`n" -ForegroundColor Yellow

node backend/src/server.js
