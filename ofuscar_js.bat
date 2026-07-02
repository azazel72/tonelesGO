@echo off
setlocal

set "SRC=C:\xampp\htdocs\paezlobato\js"
set "DST=C:\xampp\htdocs\PaezLobatoServidor\js"
set "OBF=C:\Users\RAFAEL\AppData\Roaming\npm\javascript-obfuscator.cmd"

if not exist "%DST%" mkdir "%DST%"

"%OBF%" "%SRC%" --output "%DST%" --compact true --control-flow-flattening true --control-flow-flattening-threshold 1 --dead-code-injection true --dead-code-injection-threshold 0.5 --string-array true --string-array-encoding rc4 --string-array-threshold 1 --rename-globals false --self-defending true --disable-console-output true --identifier-names-generator hexadecimal

pause