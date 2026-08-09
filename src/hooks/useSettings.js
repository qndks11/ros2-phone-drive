import { useState } from 'react'

const DEFAULT_SETTINGS = {
  rosbridgeUrl: 'ws://10.155.119.16:9090',
  maxVelocity: 4,
  maxSteeringAngle: 0.5,
  fullLockDegrees: 45,
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return { settings, updateSetting }
}
