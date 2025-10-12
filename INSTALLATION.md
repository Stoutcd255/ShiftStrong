# ShiftStrong Installation Guide (Windows)

ShiftStrong ships with a Windows-friendly bootstrapper so officers can launch
the Electron experience as soon as the repository is downloaded. The
installer automates dependency setup, builds the renderer bundle, and opens
the desktop shell without requiring manual terminal work.

## Quick start on Windows

1. Install [Node.js LTS](https://nodejs.org/en/download) if it is not already on
your workstation. This provides both `node` and `npm` which the launcher uses.
2. Download or clone the ShiftStrong repository.
3. Open the `installers\\windows` folder.
4. Double-click `ShiftStrongInstaller.bat` (or right-click and run as
   administrator if your environment requires elevated scripts). The batch file
   calls the PowerShell bootstrapper with execution policy bypass so it
   can run even when PowerShell scripts are restricted.
   - If your workstation still blocks the script, open PowerShell as an
     administrator and run `Set-ExecutionPolicy -Scope Process Bypass` before
     launching the batch file. This change applies only to the current window.
5. The installer will:
   - verify Node.js/npm availability,
   - install npm dependencies using the checked-in lockfile,
   - produce a fresh production build (`npm run build`), and
   - launch Electron pointed at this repository.
6. Subsequent launches reuse the installed dependencies. If nothing changed in
   the source code you can rerun the batch file; it will perform a quick
   dependency sync and rebuild before opening the dashboard.

> **Tip:** Windows writes the installer log to `installers\windows\install.log`.
> Open the file in Notepad if you need to review the build output or share it
> with IT for troubleshooting.

Installer output is mirrored to the same log file. Share it with your IT lead if
you need troubleshooting assistance.

## Packaging a distributable build

For a signed public release you should package the application on a Windows
machine. The repository includes a script in `package.json` to create a
Windows build with Electron Packager:

```json
{
  "scripts": {
    "package:win": "npm run build && electron-packager . ShiftStrong --platform=win32 --arch=x64 --out=dist/win --overwrite --icon=assets/all_badge.ico"
  }
}
```

Run `npm run package:win` to produce a folder inside `dist/win` containing
`ShiftStrong.exe` and its supporting resources. From there you can wrap the
output in an MSI/EXE installer using your preferred tooling (e.g. Squirrel,
MSIX, or Inno Setup) and apply Authenticode signatures before distribution.

## macOS and Linux notes

The Windows installer replaces the earlier macOS `.app` bundle. macOS or Linux
users can continue to run the project by cloning the repository, installing
Node.js, and executing `npm install` followed by `npm run dev` or
`npm run start`. Packaging scripts for those platforms can be added later if
you plan to distribute native builds outside Windows.

## Publishing on GitHub

When you're ready to distribute ShiftStrong publicly:

1. Push the repository to GitHub following the steps in the main [`README`](README.md).
2. Confirm that the **Build** workflow finishes successfully for your commit.
3. Run `npm run package:win` locally (or on a build runner) and upload the `dist/win` output as release assets.
4. Draft a GitHub Release that summarizes changes, attaches the packaged artifacts, and links back to this installation guide for end users.

These steps ensure every downloadable build is traceable to a tagged commit and covered by the automated build checks.
