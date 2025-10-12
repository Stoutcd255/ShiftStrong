# ShiftStrong

ShiftStrong is a Windows-focused Electron application that helps first responders balance macros, strength programming, and recovery. The UI embraces a neon-precinct, 1950s diner aesthetic while delivering credentialed onboarding, AI macro coaching, and an interactive anatomy atlas with police-themed workouts.

## Features

- **Guided installer** — Officers choose their precinct patch, configure install options, and relaunch the installer any time.
- **Secure auth** — Local hashed credential store with remembered accounts, signup roster flow, and saved briefings.
- **Macro intelligence** — Weekly meters, macro target analytics, and a conversational AI Dispatch assistant that can adjust targets and log entries.
- **Workout atlas** — Interactive muscle map with 30+ curated exercises and detailed descriptions for each group.
- **Windows polish** — Segoe UI typography, accent-aware focus states, and PowerShell/batch installers for streamlined setup.

## Getting started locally

1. Install [Node.js 20 LTS](https://nodejs.org/en/download) (includes npm).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the developer experience:
   ```bash
   npm run dev
   ```
4. Create a production build:
   ```bash
   npm run build
   ```
5. Package a Windows desktop build:
   ```bash
   npm run package:win
   ```

For detailed installer behavior and troubleshooting tips, see [`INSTALLATION.md`](INSTALLATION.md) and the resources under [`installers/windows`](installers/windows/).

## Preparing the repository for GitHub

1. Create a new GitHub repository (public or private) and copy its remote URL.
2. Initialize the local repository if needed and add the GitHub remote:
   ```bash
   git init
   git remote add origin https://github.com/your-org/ShiftStrong.git
   ```
3. Ensure your author information is set and commit your local work:
   ```bash
   git config user.name "Your Name"
   git config user.email "you@example.com"
   git add .
   git commit -m "Initial ShiftStrong import"
   ```
4. Push the code to GitHub:
   ```bash
   git push -u origin main
   ```
5. Review the generated GitHub Actions build (defined in `.github/workflows/ci.yml`) to confirm the Windows production build succeeds.

### Managing releases

- Tag a version for distribution:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```
- Create a GitHub Release and attach the packaged artifacts from `dist/win`.
- Update the [`package.json`](package.json) `version` field to reflect new releases.

## Repository structure

```
.
├── installers/          # Windows installer scripts and docs
├── src/                 # React renderer code, components, and styles
├── main.js              # Electron main process
├── preload.js           # Preload bridge
├── webpack.config.js    # Bundler configuration
└── .github/workflows/   # GitHub Actions pipeline
```

## License

Licensed under the [MIT License](LICENSE).
