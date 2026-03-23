import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../assets/icon-source.png?asset'

type UpdateStatusPayload = {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  progress?: number
  message?: string
  releaseNotes?: string | null
}

let mainWindow: BrowserWindow | null = null
let updaterInitialized = false

const sendUpdateStatus = (payload: UpdateStatusPayload): void => {
  mainWindow?.webContents.send('update-status', payload)
}

const registerAutoUpdater = (): void => {
  if (updaterInitialized) return
  updaterInitialized = true

  autoUpdater.autoDownload = false

  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({ state: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus({
      state: 'available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : null
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus({ state: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus({ state: 'downloading', progress: Math.round(progress.percent) })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus({ state: 'downloaded', version: info.version })
  })

  autoUpdater.on('error', (error) => {
    sendUpdateStatus({
      state: 'error',
      message: error?.message ?? 'Unknown auto-update error.'
    })
  })

  ipcMain.on('update-download', () => {
    if (!app.isPackaged) return

    autoUpdater.downloadUpdate().catch((error) => {
      sendUpdateStatus({ state: 'error', message: error?.message ?? 'Download failed.' })
    })
  })

  ipcMain.on('update-install', () => {
    if (!app.isPackaged) return

    autoUpdater.quitAndInstall()
  })

  autoUpdater.checkForUpdates().catch((error) => {
    sendUpdateStatus({ state: 'error', message: error?.message ?? 'Update check failed.' })
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.once('did-finish-load', () => {
    if (app.isPackaged) {
      registerAutoUpdater()
    } else {
      sendUpdateStatus({
        state: 'idle',
        message: 'Auto-update runs only in packaged builds.'
      })
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
