# Task 1.4 – Auto-Update Demo Playbook

This guide walks through the exact steps needed to satisfy Task 1.4: shipping two GitHub releases (v1.0.0 and v1.1.0), demonstrating the in-app auto-update flow, and collecting evidence.

## Prerequisites

- GitHub repository `ilovapotato05/my-weather` with the `main` branch (v1.0.0) and the `version-2` branch (v1.1.0 visible change).
- A Personal Access Token with `repo` scope exposed to the build via the `GH_TOKEN` environment variable.
- Latest Node.js LTS, npm, and the project dependencies installed (`npm install`).
- A clean `dist/` by running `npm run build` before publishing.

> ℹ️ Electron auto-updates only work in packaged builds. The `release*` scripts always build production assets and upload installers/delta files to GitHub Releases.

## Publish v1.0.0 (main branch)

1. Check out the mainline version:
   ```bash
   git checkout main
   git pull
   ```
2. Confirm `package.json` reads `"version": "1.0.0"` and that the UI matches the baseline design.
3. Build and publish the release artifact(s):
   ```bash
   set GH_TOKEN=YOUR_TOKEN
   npm run release:win
   ```
   - Use `npm run release:mac` / `npm run release:linux` if you need additional targets.
4. After electron-builder finishes, verify that GitHub shows the new release/tag `v1.0.0` with installers and the automatically generated latest.yml/delta files.

## Publish v1.1.0 (version-2 branch)

1. Switch to the branch that contains the visible change:
   ```bash
   git checkout version-2
   git pull
   ```
2. Update `package.json` to `"version": "1.1.0"` if it has not been bumped yet, and commit the change.
3. Double-check that the UI change is obvious (e.g., the refreshed header styling) so the update is easy to spot in the demo.
4. Publish the release:
   ```bash
   set GH_TOKEN=YOUR_TOKEN
   npm run release:win
   ```
5. Tag the build as `v1.1.0` on GitHub Releases and add short release notes describing the visual change and the auto-update fix.

## Demonstrate the auto-update flow

1. Download and install the signed `v1.0.0` installer from GitHub Releases.
2. Launch the installed `My Weather` app while connected to the internet.
3. Observe the `Update status` banner inside the home screen:
   - It first shows “Checking for updates…”.
   - Once `v1.1.0` is detected, the banner switches to “Version 1.1.0 is available” with a **Download update** CTA.
4. Click **Download update** to invoke `autoUpdater.downloadUpdate()`; progress is surfaced via the banner.
5. After the download finishes, click **Restart & install**. The app restarts on `v1.1.0` with the new UI visible.
6. Re-open the About/version view (or inspect the GitHub release assets) to confirm the version string advanced to `1.1.0`.

## Evidence to capture

- Screenshot of the running `v1.0.0` app (old UI) showing the “Version 1.1.0 is available” banner.
- Screenshot of the download progress state.
- Screenshot after restart that highlights the new `v1.1.0` UI.
- Optional: a short screen recording covering steps 2–5 above.

## Troubleshooting tips

- If the banner never appears, confirm the machine can reach GitHub and that the latest release is newer than the installed version.
- Delete `%LOCALAPPDATA%/my-weather-updater` between tests to clear cached delta downloads.
- Run the app with `LOG_ELECTRON_AUTO_UPDATE=1` to print verbose updater logs to the DevTools console.
