@echo off
chcp 65001 >nul
title CicloMetrics Web - Servidor Local

echo ========================================================
echo        🚴 INICIANDO CICLOMETRICS WEB (HOST LOCAL)
echo ========================================================
echo.

:: Verificar si node está en PATH o en LOCALAPPDATA
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    ) else (
        echo [ERROR] No se encontro Node.js en el sistema.
        echo Por favor ejecuta el script de instalación o agrega Node al PATH.
        pause
        exit /b 1
    )
)

:: Verificar si frontend/dist existe; si no, compilarlo
if not exist "frontend\dist\index.html" (
    echo [1/3] Compilando frontend para produccion local...
    cd frontend
    call npm run build
    cd ..
) else (
    echo [1/3] Frontend compilado detectado en frontend/dist.
)

echo [2/3] Abriendo navegador en http://localhost:5000 ...
start http://localhost:5000

echo [3/3] Iniciando servidor Express en puerto 5000...
echo.
echo Presiona Ctrl + C para detener el servidor local.
echo ========================================================
echo.

node backend\src\server.js
pause
