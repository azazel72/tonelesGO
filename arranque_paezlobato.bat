@echo off
setlocal

REM ==========================================
REM CONFIGURA AQUI TU COMANDO REAL
REM Ejemplo: set "APP_COMMAND=python ningenia_server.py"
REM ==========================================
set "APP_COMMAND=python -m servidor"

cd /d "%~dp0"
echo Iniciando: %APP_COMMAND%
start "paezlobato_app" /min cmd /c "%APP_COMMAND%"
echo Proceso lanzado en ventana minimizada.
endlocal
