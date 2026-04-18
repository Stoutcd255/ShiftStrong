# ShiftStrong (Windows EXE Launch Guide)

ShiftStrong is a tactical workout + macro tracker desktop app built with Electron + React.

## Goal: launch from a `.exe`
This project now packages a Windows build that includes a native app executable:

- `release/ShiftStrong-win32-x64/ShiftStrong.exe`

You can double-click that `.exe` to launch the app.

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

## 4) Build the Windows app package (contains .exe)
```powershell
npm run dist:win
```

Output folder:
- `release/ShiftStrong-win32-x64/`

Launch file:
- `release/ShiftStrong-win32-x64/ShiftStrong.exe`

---

## Developer mode (live app)
```powershell
npm run dev
```

## Security defaults
- Electron now runs the renderer with `contextIsolation: true`.
- `nodeIntegration` is disabled in the renderer.
- `preload.js` is used as the only bridge boundary for renderer-exposed APIs.

## Step-by-step for end users
1. Copy the entire `ShiftStrong-win32-x64` folder to the target PC.
2. Open folder.
3. Double-click `ShiftStrong.exe`.
4. (Optional) Right-click `ShiftStrong.exe` → **Send to > Desktop (create shortcut)**.

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
