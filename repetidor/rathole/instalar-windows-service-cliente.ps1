param(
    [string]$VpsHost = "212.227.228.46",
    [int]$TunnelPort = 2333,

    [int]$WsLocalPort = 5001,
    [string]$WsToken = "a8f3c9e7d4b6f1a2e3c4d5b7a9f8e6c3",

    [int]$HttpLocalPort = 8080,
    [string]$HttpToken = "b7e6c3a9f8d5b4c2a1f3e7d6c8b9a4f2",

    [string]$InstallDir = "C:\rathole",
    [string]$ServiceName = "RatholeClient"
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

    Write-Status "Descomprimiendo rathole..."
    Expand-Archive -Path $zipPath -DestinationPath $TargetDir -Force

    $exe = Get-ChildItem -Path $TargetDir -Recurse -Filter "rathole.exe" | Select-Object -First 1
    if (-not $exe) {
        throw "No se encontro rathole.exe."
    }

    $targetExe = Join-Path $TargetDir "rathole.exe"
    if ($exe.FullName -ne $targetExe) {
        Copy-Item -LiteralPath $exe.FullName -Destination $targetExe -Force
    }

    return $targetExe
}

function Download-Nssm {
    param([string]$TargetDir)

    $nssmDir = Join-Path $TargetDir "nssm"
    $nssmExe = Join-Path $nssmDir "nssm.exe"

    if (Test-Path $nssmExe) {
        return $nssmExe
    }

    New-Item -ItemType Directory -Path $nssmDir -Force | Out-Null

    $zipPath = Join-Path $TargetDir "nssm.zip"
    $downloadUrl = "https://nssm.cc/release/nssm-2.24.zip"

    Write-Status "Descargando NSSM..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

    Write-Status "Descomprimiendo NSSM..."
    Expand-Archive -Path $zipPath -DestinationPath $TargetDir -Force

    $found = Get-ChildItem -Path $TargetDir -Recurse -Filter "nssm.exe" |
        Where-Object { $_.FullName -match "\\win64\\nssm\.exe$" } |
        Select-Object -First 1

    if (-not $found) {
        throw "No se encontro nssm.exe win64."
    }

    Copy-Item -LiteralPath $found.FullName -Destination $nssmExe -Force
    return $nssmExe
}

function Write-ClientConfig {
    param(
        [string]$TargetDir,
        [string]$VpsAddress,
        [int]$RemotePort,
        [int]$WsPort,
        [string]$WsSecret,
        [int]$HttpPort,
        [string]$HttpSecret
    )

    $configPath = Join-Path $TargetDir "client.toml"

@"
[client]
remote_addr = "$($VpsAddress):$($RemotePort)"

[client.services.ws5001]
token = "$WsSecret"
local_addr = "127.0.0.1:$($WsPort)"

[client.services.http8080]
token = "$HttpSecret"
local_addr = "127.0.0.1:$($HttpPort)"
"@ | Set-Content -LiteralPath $configPath -Encoding ASCII

    return $configPath
}

function Remove-ScheduledTaskIfExists {
    $taskName = "RatholeClient"
    $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Status "Eliminando tarea programada antigua..."
        Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }
}

function Install-RatholeService {
    param(
        [string]$NssmExe,
        [string]$ExePath,
        [string]$ConfigPath,
        [string]$Name,
        [string]$WorkingDir
    )

    $existingService = Get-Service -Name $Name -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Status "Parando servicio existente..."
        Stop-Service -Name $Name -Force -ErrorAction SilentlyContinue

        Write-Status "Eliminando servicio existente..."
        & $NssmExe remove $Name confirm | Out-Null

        Start-Sleep -Seconds 2
    }

    Write-Status "Instalando servicio Windows real..."
    & $NssmExe install $Name $ExePath $ConfigPath | Out-Null

    & $NssmExe set $Name AppDirectory $WorkingDir | Out-Null
    & $NssmExe set $Name DisplayName "Rathole Client" | Out-Null
    & $NssmExe set $Name Description "Rathole TCP tunnel client" | Out-Null
    & $NssmExe set $Name Start SERVICE_AUTO_START | Out-Null

    & $NssmExe set $Name AppStdout (Join-Path $WorkingDir "rathole-service.log") | Out-Null
    & $NssmExe set $Name AppStderr (Join-Path $WorkingDir "rathole-service-error.log") | Out-Null
    & $NssmExe set $Name AppRotateFiles 1 | Out-Null
    & $NssmExe set $Name AppRotateOnline 1 | Out-Null
    & $NssmExe set $Name AppRotateBytes 1048576 | Out-Null

    & $NssmExe set $Name AppExit Default Restart | Out-Null

    Write-Status "Arrancando servicio..."
    Start-Service -Name $Name
}

Ensure-Admin
Enable-Tls12

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

$ratholeExe = Join-Path $InstallDir "rathole.exe"
if (Test-Path $ratholeExe) {
    Write-Status "Rathole ya está instalado."
} else {
    $ratholeExe = Download-Rathole -TargetDir $InstallDir
}

$nssmExe = Download-Nssm -TargetDir $InstallDir

$configPath = Write-ClientConfig `
    -TargetDir $InstallDir `
    -VpsAddress $VpsHost `
    -RemotePort $TunnelPort `
    -WsPort $WsLocalPort `
    -WsSecret $WsToken `
    -HttpPort $HttpLocalPort `
    -HttpSecret $HttpToken

Write-Status "Configuración creada/actualizada:"
Get-Content -LiteralPath $configPath

Remove-ScheduledTaskIfExists

Install-RatholeService `
    -NssmExe $nssmExe `
    -ExePath $ratholeExe `
    -ConfigPath $configPath `
    -Name $ServiceName `
    -WorkingDir $InstallDir

Write-Status "Servicio instalado y arrancado: $ServiceName"

Write-Status "Comandos útiles:"
Write-Host "Get-Service $ServiceName"
Write-Host "Restart-Service $ServiceName"
Write-Host "Stop-Service $ServiceName"
Write-Host "Get-Content C:\rathole\rathole-service-error.log -Tail 50"