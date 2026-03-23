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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
