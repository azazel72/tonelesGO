param(
    [string]$VpsHost = "212.227.228.46",
    [int]$TunnelPort = 2333,

    [int]$WsLocalPort = 5001,
    [string]$WsToken = "a8f3c9e7d4b6f1a2e3c4d5b7a9f8e6c3",

    [int]$HttpLocalPort = 8080,
    [string]$HttpToken = "b7e6c3a9f8d5b4c2a1f3e7d6c8b9a4f2",

    [string]$InstallDir = "C:\rathole",
    [switch]$CreateScheduledTask
)

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message)
    Write-Host "[rathole] $Message"
}

function Ensure-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "Ejecuta este script en PowerShell como administrador."
    }
}

function Enable-Tls12 {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
}

function Download-Rathole {
    param([string]$TargetDir)

    $zipPath = Join-Path $TargetDir "rathole.zip"
    $downloadUrl = "https://github.com/rathole-org/rathole/releases/latest/download/rathole-x86_64-pc-windows-msvc.zip"

    Write-Status "Descargando rathole..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

    Write-Status "Descomprimiendo..."
    Expand-Archive -Path $zipPath -DestinationPath $TargetDir -Force

    $exe = Get-ChildItem -Path $TargetDir -Recurse -Filter "rathole.exe" | Select-Object -First 1
    if (-not $exe) {
        throw "No se encontro rathole.exe despues de descomprimir."
    }

    $targetExe = Join-Path $TargetDir "rathole.exe"
    if ($exe.FullName -ne $targetExe) {
        Copy-Item -LiteralPath $exe.FullName -Destination $targetExe -Force
    }

    return $targetExe
}

function Write-ClientConfig {
    param(
        [string]$TargetDir,
        [string]$Host,
        [int]$RemotePort,
        [int]$WsPort,
        [string]$WsSecret,
        [int]$HttpPort,
        [string]$HttpSecret
    )

    $configPath = Join-Path $TargetDir "client.toml"

@"
[client]
remote_addr = "$Host`:$RemotePort"

[client.services.ws5001]
token = "$WsSecret"
local_addr = "127.0.0.1`:$WsPort"

[client.services.http8080]
token = "$HttpSecret"
local_addr = "127.0.0.1`:$HttpPort"
"@ | Set-Content -LiteralPath $configPath -Encoding ASCII

    return $configPath
}

function Install-ScheduledTask {
    param(
        [string]$ExePath,
        [string]$ConfigPath
    )

    $taskName = "RatholeClient"

    $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existing) {
        Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    $action = New-ScheduledTaskAction -Execute $ExePath -Argument "`"$ConfigPath`""
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartCount 999 `
        -RestartInterval (New-TimeSpan -Minutes 1)

    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings | Out-Null

    Start-ScheduledTask -TaskName $taskName
}

Ensure-Admin
Enable-Tls12

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

if (Test-Path -Path (Join-Path $InstallDir "rathole.exe")) {
    Write-Status "Rathole ya está instalado. Omitiendo descarga."
    $exePath = Join-Path $InstallDir "rathole.exe"
} else {
    $exePath = Download-Rathole -TargetDir $InstallDir
}

$configPath = Write-ClientConfig `
    -TargetDir $InstallDir `
    -Host $VpsHost `
    -RemotePort $TunnelPort `
    -WsPort $WsLocalPort `
    -WsSecret $WsToken `
    -HttpPort $HttpLocalPort `
    -HttpSecret $HttpToken

Write-Status "Configuración creada/actualizada en $configPath"
Get-Content -LiteralPath $configPath

if ($CreateScheduledTask) {
    Write-Status "Creando tarea automática de Windows..."
    Install-ScheduledTask -ExePath $exePath -ConfigPath $configPath
    Write-Status "Tarea creada/reiniciada: RatholeClient"
} else {
    Write-Status "No se ha creado tarea automática."
}

Write-Status "Prueba manual:"
Write-Host "`"$exePath`" `"$configPath`""