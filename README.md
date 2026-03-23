# My Weather

> A cross-platform Electron desktop client (React + TypeScript) that fetches current conditions from OpenWeatherMap and supports in-app auto-updates via electron-updater.

## Stack

- Electron 39 + electron-vite build pipeline
- React 19 with functional components and hooks
- Axios for REST calls
- electron-builder for packaging and GitHub publishing

## Getting started

```bash
npm install      # install deps once
npm run dev      # start renderer + main in watch mode
npm run build    # typecheck + bundle all entry points
```

Targeted packaging helpers are available when you need a distributable:

```bash
npm run build:win   # package for Windows only
npm run build:mac   # package for macOS only
npm run build:linux # package for Linux only
```

## Release / auto-update scripts

| Command | Purpose |
| --- | --- |
| npm run release | Build every configured target and publish to the GitHub Releases feed defined in electron-builder.yml |
| npm run release:win | Windows-only release + publish |
| npm run release:mac | macOS-only release + publish |
| npm run release:linux | Linux-only release + publish |

Set `GH_TOKEN` before running any release script so electron-builder can upload installers and delta files.

## Auto-update architecture (Task 1.4)

- Main process wiring lives in [src/main/index.ts](src/main/index.ts). It registers autoUpdater listeners once the window loads, proxies download/install IPC calls, and streams state back to the renderer.
- The preload bridge in [src/preload/index.ts](src/preload/index.ts) exposes onUpdateStatus, downloadUpdate, and installUpdate via window.api.
- The React banner component [src/renderer/src/components/UpdateBanner.tsx](src/renderer/src/components/UpdateBanner.tsx) renders the UX for checking, available, downloading, and error states.

Timeline on launch:

1. autoUpdater.checkForUpdates() runs as soon as the packaged window finishes loading.
2. Renderer subscribes to update-status events; when available, the Download update CTA calls window.api.downloadUpdate().
3. After the download completes, the Restart & install action triggers autoUpdater.quitAndInstall().

## Branch and version map

- main → package.json version 1.0.0. This is the baseline UI.
- version-2 → bumps to 1.1.0 and carries the visible design tweak required for Task 1.4.

## Task 1.4 demo checklist

1. Publish v1.0.0 from main and v1.1.0 from version-2 with the new release helpers.
2. Follow the detailed walkthrough in [docs/auto-update-demo.md](docs/auto-update-demo.md) to show the banner detecting, downloading, and installing the update while the app is running.
3. Capture the requested screenshots or screen recording and attach them to your submission/readme as proof.

Need more context for the showcase? The playbook linked above also includes troubleshooting tips and evidence requirements.
