ShiftStrong Windows Bootstrapper
=================================

Use `ShiftStrongInstaller.bat` or run the PowerShell script directly to install
and launch the Electron dashboard on Windows.

Both launchers will:
  1. verify that Node.js and npm are available,
  2. install npm dependencies according to `package-lock.json`,
  3. build the production renderer assets, and
  4. open the ShiftStrong Electron shell.

Logs are written to `install.log` in this folder. If you run into issues,
open the log in a text editor and share it with your system administrator or
the ShiftStrong team for troubleshooting.

If PowerShell blocks script execution, open an elevated PowerShell window and
run `Set-ExecutionPolicy -Scope Process Bypass` before starting the installer.
The command only relaxes the policy for that specific session so your global
settings remain intact.

Advanced usage:
  * `ShiftStrongInstaller.ps1 -LaunchMode build` builds without launching
    Electron.
  * `ShiftStrongInstaller.ps1 -LaunchMode launch` skips the build step and
    simply opens Electron (useful if you already ran a build).
