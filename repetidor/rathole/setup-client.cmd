@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0setup-client.ps1" %*
endlocal
