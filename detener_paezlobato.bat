@echo off
setlocal

REM ==========================================
REM OPCION 1: Cerrar por titulo de ventana del cmd lanzado
REM ==========================================
taskkill /FI "WINDOWTITLE eq paezlobato_app" /T /F >nul 2>&1

REM ==========================================
REM OPCION 2 (fallback): cerrar por nombre de proceso
REM Descomenta y ajusta si lo necesitas (python.exe, php.exe, node.exe...)
REM taskkill /IM python.exe /F
REM ==========================================

echo Si no habia ventana con titulo paezlobato_app, revisa opcion 2 en este script.
endlocal
