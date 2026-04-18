# ShiftStrong (Windows Setup + Run Guide)

ShiftStrong is a tactical workout + macro tracker desktop app (Electron + React).

## Features in this build
- Weight, macro, workout, exercise, meal, and readiness tracking.
- Auto-programming, progression suggestions, trends, anomaly checks.
- Local persistence with backup + mirror restore paths.
- Splash screen and tactical UI theme.

## 1) Prerequisites (Windows)
1. Install **Node.js 20+** (LTS recommended): https://nodejs.org
2. Open **PowerShell**.
3. Verify tools:
   ```powershell
   node -v
   npm -v
   ```

## 2) Install dependencies
From the project root folder:
```powershell
npm install
```

## 3) Run tests (recommended)
```powershell
npm test
```

## 4) Build renderer bundle
```powershell
npm run build
```

## 5) Run app in development
```powershell
npm run dev
```
This starts webpack watch + Electron together.

## 6) Create Windows distributable build
```powershell
npm run build:electron
```
Output is written to `dist/`.

## 7) Data backup + restore in app
Inside the app UI:
- **Export Backup** creates a JSON snapshot.
- **Import Backup** restores from a JSON file.
- **Sync Mirror / Restore Mirror** use local mirror storage for recovery.

## Troubleshooting
- If Electron window is blank, run `npm run build` first.
- If install fails, delete `node_modules` and `package-lock.json`, then `npm install` again.
- If data looks corrupted, use **Restore Mirror** or re-import a backup JSON.
