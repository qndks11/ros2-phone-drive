import { useCallback, useEffect, useRef, useState } from 'react'

const supported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const needsExplicitPermission =
  supported && typeof window.DeviceOrientationEvent.requestPermission === 'function'

// Gravity-based left/right tilt (roll), compensated for the current screen
// orientation. Unlike compass heading, this doesn't depend on which way the
// phone is facing in the world, so walking around the vehicle to follow it
// doesn't shift the steering center the way yaw did.
function computeRoll(event) {
  const beta = event.beta ?? 0
  const gamma = event.gamma ?? 0
  const angle = screen.orientation?.angle ?? window.orientation ?? 0
  switch (angle) {
    case 90:
      return -beta
    case -90:
    case 270:
      return beta
    case 180:
      return -gamma
    default:
      return gamma
  }
}

// Shortest signed difference from `zero` to `roll`, in [-180, 180].
function shortestDelta(roll, zero) {
  const raw = roll - zero
  return ((raw + 180) % 360 + 360) % 360 - 180
}

export function useDeviceOrientation() {
  const [permissionState, setPermissionState] = useState(
    needsExplicitPermission ? 'unknown' : 'granted',
  )
  const [rollDelta, setRollDelta] = useState(0)

  const rawRollRef = useRef(0)
  const calibrationRef = useRef(0)
  const frameRequestedRef = useRef(false)

  const handleOrientation = useCallback((event) => {
    rawRollRef.current = computeRoll(event)
    if (!frameRequestedRef.current) {
      frameRequestedRef.current = true
      requestAnimationFrame(() => {
        frameRequestedRef.current = false
        setRollDelta(shortestDelta(rawRollRef.current, calibrationRef.current))
      })
    }
  }, [])

  useEffect(() => {
    if (!supported || permissionState !== 'granted') return undefined
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [permissionState, handleOrientation])

  const requestPermission = useCallback(async () => {
    if (!needsExplicitPermission) {
      setPermissionState('granted')
      return
    }
    try {
      const result = await window.DeviceOrientationEvent.requestPermission()
      setPermissionState(result === 'granted' ? 'granted' : 'denied')
    } catch {
      setPermissionState('denied')
    }
  }, [])

  const calibrate = useCallback(() => {
    calibrationRef.current = rawRollRef.current
    setRollDelta(0)
  }, [])

  return { supported, needsExplicitPermission, permissionState, requestPermission, rollDelta, calibrate }
}
