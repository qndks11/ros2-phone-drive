import { useState } from 'react'

const STATUS_LABEL = {
  disconnected: 'Disconnected',
  connecting: 'Connecting…',
  connected: 'Connected',
  error: 'Connection error',
}

export function SettingsPanel({ settings, onChange, status, onConnect, onDisconnect }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="settings-panel">
      <div className="settings-panel__header">
        <span className={`status-badge status-badge--${status}`}>{STATUS_LABEL[status]}</span>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          {open ? 'Hide Settings' : 'Settings'}
        </button>
      </div>
      {open && (
        <div className="settings-panel__body">
          <label>
            Rosbridge URL
            <input
              type="text"
              value={settings.rosbridgeUrl}
              onChange={(event) => onChange('rosbridgeUrl', event.target.value)}
            />
          </label>
          <label>
            Max Velocity (m/s)
            <input
              type="number"
              step="0.1"
              min="0"
              value={settings.maxVelocity}
              onChange={(event) => onChange('maxVelocity', Number(event.target.value))}
            />
          </label>
          <label>
            Max Steering Angle (rad)
            <input
              type="number"
              step="0.05"
              min="0"
              value={settings.maxSteeringAngle}
              onChange={(event) => onChange('maxSteeringAngle', Number(event.target.value))}
            />
          </label>
          <label>
            Full-lock Phone Rotation (deg)
            <input
              type="number"
              step="5"
              min="5"
              value={settings.fullLockDegrees}
              onChange={(event) => onChange('fullLockDegrees', Number(event.target.value))}
            />
          </label>
          {status === 'connected' ? (
            <button type="button" onClick={onDisconnect}>
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConnect(settings.rosbridgeUrl)}
              disabled={status === 'connecting'}
            >
              Connect
            </button>
          )}
        </div>
      )}
    </div>
  )
}
