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

---

## AI Assistant setup (step-by-step)

You can now use the built-in **AI Coach** tab in ShiftStrong.

### 1) Create an OpenAI API key
1. Sign in to your OpenAI account.
2. Generate an API key.
3. Keep it secret (never commit it to git).

### 2) Create a local `.env` file in the project root
Add:

```dotenv
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_MODEL` is optional; if omitted the app defaults to `gpt-4.1-mini`.

### 3) Install dependencies
```powershell
npm install
```

### 4) Build renderer and launch app
```powershell
npm run build:renderer
npm run dev
```

### 5) Open the **AI Coach** tab
1. Launch ShiftStrong.
2. Click **AI Coach** in top navigation.
3. Ask a coaching question (workout, macros, recovery, schedule).

### 6) What data is sent to AI
Each request includes a summarized context from your app state:
- date
- readiness score + guidance
- latest weight
- today macro totals
- goals
- recent workouts
- recent lift logs

### 7) Package for Windows EXE
If you package the app for Windows, ensure `OPENAI_API_KEY` is available in the runtime environment where the EXE runs.

### 8) Common AI setup issues
- **“Missing OPENAI_API_KEY”**: `.env` missing or variable not loaded.
- **Network/CSP errors**: ensure internet access to `https://api.openai.com`.
- **Empty AI reply**: retry; the model can occasionally return minimal text for vague prompts.
