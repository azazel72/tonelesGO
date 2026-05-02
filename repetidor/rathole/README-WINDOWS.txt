Uso rapido en Windows

1. Abre PowerShell como administrador.
2. Entra en esta carpeta.
3. Ejecuta:

powershell -ExecutionPolicy Bypass -File .\setup-client.ps1 -CreateScheduledTask

Si quieres cambiar algo:

powershell -ExecutionPolicy Bypass -File .\setup-client.ps1 -VpsHost 212.227.228.46 -TunnelPort 2333 -LocalPort 5001 -Token 8f2d6b41c9a74f2bb03f0b8e5c4d91aa -CreateScheduledTask

Alternativa desde cmd:

setup-client.cmd -CreateScheduledTask

El script:
- descarga rathole en C:\rathole
- crea C:\rathole\client.toml
- opcionalmente registra la tarea RatholeClient al arrancar Windows

Luego los moviles deben apuntar a:

ws://212.227.228.46:7002
