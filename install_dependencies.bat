@echo off
echo ===================================================
echo      TalentAI Pro - Instalador de Dependencias
echo ===================================================
echo.
echo 1. Verificando Node.js...
node -v
if %errorlevel% neq 0 (
    echo [ERROR] No se encuentra Node.js. Por favor instalalo desde nodejs.org
    pause
    exit
)
echo [OK] Node.js detectado.
echo.
echo 2. Verificando NPM...
npm -v
if %errorlevel% neq 0 (
    echo [ERROR] No se encuentra NPM.
    pause
    exit
)
echo [OK] NPM detectado.
echo.
echo 3. Instalando librerias (esto puede tardar unos minutos)...
echo.
call npm install
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema instalando las dependencias.
) else (
    echo [EXITO] Todas las dependencias se instalaron correctamente.
)
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause
