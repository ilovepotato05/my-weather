import { ElectronAPI } from '@electron-toolkit/preload'

type UpdateStatusPayload = {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  progress?: number
  message?: string
  releaseNotes?: string | null
}

type UpdaterBridge = {
  onUpdateStatus: (callback: (payload: UpdateStatusPayload) => void) => () => void
  downloadUpdate: () => void
  installUpdate: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api?: UpdaterBridge
  }
}
