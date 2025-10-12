@echo off
set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%ShiftStrongInstaller.ps1" %*
if errorlevel 1 (
  echo.
  echo ShiftStrong installer encountered an error. Review installers\windows\install.log for details.
  pause
) else (
  echo.
  echo ShiftStrong launched successfully. Press any key to close this window.
  pause
)
