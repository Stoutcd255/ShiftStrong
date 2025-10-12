param(
    [string]$LaunchMode = "run"  # run | build | launch
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\\..')
$logPath = Join-Path $PSScriptRoot 'install.log'

function Write-Log {
    param([string]$Message, [ConsoleColor]$Color = [ConsoleColor]::Gray)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "[$timestamp] $Message"
    $line | Out-File -FilePath $logPath -Encoding UTF8 -Append
    $origColor = $Host.UI.RawUI.ForegroundColor
    try {
        $Host.UI.RawUI.ForegroundColor = $Color
        Write-Host $line
    } finally {
        $Host.UI.RawUI.ForegroundColor = $origColor
    }
}

function Assert-Command {
    param(
        [Parameter(Mandatory=$true)][string]$Command,
        [Parameter(Mandatory=$true)][string]$InstallHint
    )

    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "Required command '$Command' was not found. $InstallHint"
    }
}

try {
    Write-Log "ShiftStrong Windows Installer starting..." [ConsoleColor]::Cyan
    Write-Log "Validating Node.js toolchain"
    Assert-Command -Command 'node' -InstallHint 'Install Node.js from https://nodejs.org/en/download and re-run the installer.'
    Assert-Command -Command 'npm' -InstallHint 'Install Node.js from https://nodejs.org/en/download and re-run the installer.'

    Set-Location $root
    Write-Log "Working directory set to $root"

    $nodeModulesPath = Join-Path $root 'node_modules'
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "node_modules missing. Running npm install..." [ConsoleColor]::Yellow
        npm install | Tee-Object -FilePath $logPath -Append
    } else {
        Write-Log "Dependencies detected. Running npm install to ensure lockfile parity..." [ConsoleColor]::Yellow
        npm install --prefer-offline | Tee-Object -FilePath $logPath -Append
    }

    if ($LaunchMode -eq 'run' -or $LaunchMode -eq 'build') {
        Write-Log "Building production renderer..." [ConsoleColor]::Yellow
        npm run build | Tee-Object -FilePath $logPath -Append
    }

    if ($LaunchMode -eq 'run' -or $LaunchMode -eq 'launch') {
        Write-Log "Starting ShiftStrong Electron shell..." [ConsoleColor]::Green
        $electronCmd = 'npx'
        $electronArgs = @('electron', '.')
        Start-Process -FilePath $electronCmd -ArgumentList $electronArgs -WorkingDirectory $root -Wait
        Write-Log "Electron session completed." [ConsoleColor]::Green
    } else {
        Write-Log "LaunchMode set to '$LaunchMode'; skipping Electron startup." [ConsoleColor]::DarkGray
    }

    Write-Log "ShiftStrong Windows Installer finished." [ConsoleColor]::Cyan
}
catch {
    Write-Log "Installation failed: $($_.Exception.Message)" [ConsoleColor]::Red
    exit 1
}
