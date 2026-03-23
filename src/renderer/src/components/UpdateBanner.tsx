import type { JSX } from 'react'

export type RendererUpdateStatus = {
  state:
    | 'idle'
    | 'checking'
    | 'available'
    | 'not-available'
    | 'downloading'
    | 'downloaded'
    | 'error'
  version?: string
  progress?: number
  message?: string
  releaseNotes?: string | null
}

interface Props {
  status: RendererUpdateStatus
  onDownload: () => void
  onInstall: () => void
}

const UpdateBanner = ({ status, onDownload, onInstall }: Props): JSX.Element | null => {
  if (status.state === 'idle' || status.state === 'not-available') {
    return null
  }

  let message = status.message || ''
  let actionLabel: string | null = null
  let actionHandler: (() => void) | null = null

  switch (status.state) {
    case 'checking':
      message = 'Checking for updates...'
      break
    case 'available':
      message = `Version ${status.version ?? ''} is available.`
      actionLabel = 'Download update'
      actionHandler = onDownload
      break
    case 'downloading': {
      const progressText = typeof status.progress === 'number' ? ` (${status.progress}%)` : ''
      message = `Downloading update${progressText}...`
      break
    }
    case 'downloaded':
      message = `Update ${status.version ?? ''} downloaded. Restart to finish.`
      actionLabel = 'Restart & install'
      actionHandler = onInstall
      break
    case 'error':
      message = status.message ?? 'Auto-update failed. Please try again.'
      break
    default:
      message = status.message ?? 'You are on the latest version.'
      break
  }

  return (
    <div className={`update-banner update-banner--${status.state}`}>
      <div className="update-banner__text">
        <p className="update-banner__label">Update status</p>
        <p className="update-banner__message">{message}</p>
      </div>

      {actionLabel && actionHandler ? (
        <button className="update-banner__button" onClick={actionHandler}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

export default UpdateBanner
