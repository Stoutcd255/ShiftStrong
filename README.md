# ShiftStrong (Windows EXE Launch Guide)

ShiftStrong is a tactical workout + macro tracker desktop app built with Electron + React.

## Goal: launch from an installer wizard (`.exe`)
This project now builds a Windows **installer wizard** (NSIS) so users can install ShiftStrong like a typical downloaded app.

---

## 1) Install prerequisites
1. Install **Node.js 20+ (LTS)**: https://nodejs.org
2. Open **PowerShell** in this project folder.

## 2) Install dependencies
```powershell
npm install
```

## 3) Validate the app
```powershell
npm test
npm run build:renderer
```

> `npm run build` is an alias for `npm run build:renderer`.

## 4) Build the Windows installer wizard
```powershell
npm run dist:win
```

Output folder:
- `release/`

Installer file:
- `release/ShiftStrong-Setup-<version>.exe`

---

## Developer mode (live app)
```powershell
npm run dev
```

## CI + release automation
- GitHub Actions workflow: `.github/workflows/windows-ci.yml`
- On every push/PR it runs:
  - `npm ci`
  - `npm test`
  - `npm run build:renderer`
- On `main`, it also runs `npm run dist:win` and uploads the installer artifact from `release/*.exe`.

## Architecture notes
- `index.jsx` is now the app shell and feature composition layer.
- `src/components/HomeDashboard.jsx` owns the command-center dashboard layout.
- `src/hooks/useKeyboardTabs.js` centralizes Ctrl+number tab switching.
- `src/lib/logic.js` includes shared pure helpers (normalization, readiness, dashboard data shaping).

## Security defaults
- Electron now runs the renderer with `contextIsolation: true`.
- `nodeIntegration` is disabled in the renderer.
- `preload.js` is used as the only bridge boundary for renderer-exposed APIs.

## Step-by-step for end users
1. Download `ShiftStrong-Setup-<version>.exe`.
2. Double-click the installer.
3. In the wizard, choose install path if desired.
4. Leave **Create Desktop Shortcut** enabled (or toggle it off).
5. Complete installation and launch ShiftStrong.

---

## Troubleshooting
- If packaging fails, run:
  ```powershell
  npm install
  npm run build:renderer
  npm run dist:win
  ```
- If app window is blank, run `npm run build:renderer` and launch again.
- If antivirus prompts on unsigned binaries, sign the executable for production distribution.
