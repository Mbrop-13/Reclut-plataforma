@echo off
echo ===================================================
echo      TalentAI Pro - Reparador de Inicio
echo ===================================================
echo.
echo 1. Deteniendo procesos de node...
taskkill /F /IM node.exe >nul 2>&1
echo.
echo 2. Eliminando cache corrupta (.next)...
if exist .next (
    rmdir /s /q .next
    echo [OK] Cache eliminada.
) else (
    echo [INFO] No se encontro cache previa.
)
echo.
echo 3. Iniciando servidor en limpio...
echo.
echo POR FAVOR ESPERA - La primera carga tardara un poco mientras se reconstruye todo.
echo No cierres esta ventana.
echo.
npm run dev
pause
