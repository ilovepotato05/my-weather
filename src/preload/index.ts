import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

type UpdateStatusPayload = {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  progress?: number
  message?: string
  releaseNotes?: string | null
}

// Custom APIs for renderer
const api = {
  onUpdateStatus: (callback: (payload: UpdateStatusPayload) => void): (() => void) => {
    const subscription = (_event: IpcRendererEvent, payload: UpdateStatusPayload): void => {
      callback(payload)
    }

    ipcRenderer.on('update-status', subscription)

    return () => {
      ipcRenderer.removeListener('update-status', subscription)
    }
  },
  downloadUpdate: (): void => ipcRenderer.send('update-download'),
  installUpdate: (): void => ipcRenderer.send('update-install')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
