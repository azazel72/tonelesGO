param(
    [string]$VpsHost = "212.227.228.46",
    [int]$TunnelPort = 2333,
    [int]$LocalPort = 5001,
    [string]$Token = "8f2d6b41c9a74f2bb03f0b8e5c4d91aa",
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
        [int]$Port,
        [string]$Secret
    )

    $configPath = Join-Path $TargetDir "client.toml"
    @"
[client]
remote_addr = "$Host`:$RemotePort"

[client.services.ws5000]
token = "$Secret"
local_addr = "127.0.0.1`:$Port"
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
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    $action = New-ScheduledTaskAction -Execute $ExePath -Argument $ConfigPath
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal | Out-Null
    Start-ScheduledTask -TaskName $taskName
}

Ensure-Admin
Enable-Tls12

# Verificar si Rathole ya está instalado
if (Test-Path -Path (Join-Path $InstallDir "rathole.exe")) {
    Write-Status "Rathole ya está instalado. Omitiendo descarga."
    $exePath = Join-Path $InstallDir "rathole.exe"
} else {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    $exePath = Download-Rathole -TargetDir $InstallDir
}

# Verificar si el archivo de configuración ya existe
if (Test-Path -Path (Join-Path $InstallDir "client.toml")) {
    Write-Status "El archivo de configuración ya existe. Omitiendo creación."
    $configPath = Join-Path $InstallDir "client.toml"
} else {
    $configPath = Write-ClientConfig -TargetDir $InstallDir -Host $VpsHost -RemotePort $TunnelPort -Port $LocalPort -Secret $Token
    Write-Status "Configuración creada en $configPath"
    Get-Content -LiteralPath $configPath
}

if ($CreateScheduledTask) {
    Write-Status "Creando tarea automática de Windows..."
    Install-ScheduledTask -ExePath $exePath -ConfigPath $configPath
    Write-Status "Tarea creada: RatholeClient"
} else {
    Write-Status "No se ha creado tarea automática."
}

Write-Status "Prueba manual:"
Write-Host "`"$exePath`" `"$configPath`""
