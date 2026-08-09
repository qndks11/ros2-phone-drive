import { useCallback, useEffect, useRef, useState } from 'react'

const supported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const needsExplicitPermission =
  supported && typeof window.DeviceOrientationEvent.requestPermission === 'function'
const eventName = supported && 'ondeviceorientationabsolute' in window
  ? 'deviceorientationabsolute'
  : 'deviceorientation'

function computeHeading(event) {
  if (typeof event.webkitCompassHeading === 'number') {
    return event.webkitCompassHeading
  }
  return (360 - (event.alpha ?? 0)) % 360
}

// Shortest signed difference from `zero` to `heading`, in [-180, 180].
function shortestDelta(heading, zero) {
  const raw = heading - zero
  return ((raw + 180) % 360 + 360) % 360 - 180
}

export function useDeviceOrientation() {
  const [permissionState, setPermissionState] = useState(
    needsExplicitPermission ? 'unknown' : 'granted',
  )
  const [headingDelta, setHeadingDelta] = useState(0)

  const rawHeadingRef = useRef(0)
  const calibrationRef = useRef(0)
  const frameRequestedRef = useRef(false)

  const handleOrientation = useCallback((event) => {
    rawHeadingRef.current = computeHeading(event)
    if (!frameRequestedRef.current) {
      frameRequestedRef.current = true
      requestAnimationFrame(() => {
        frameRequestedRef.current = false
        setHeadingDelta(shortestDelta(rawHeadingRef.current, calibrationRef.current))
      })
    }
  }, [])

  useEffect(() => {
    if (!supported || permissionState !== 'granted') return undefined
    window.addEventListener(eventName, handleOrientation)
    return () => window.removeEventListener(eventName, handleOrientation)
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
    calibrationRef.current = rawHeadingRef.current
    setHeadingDelta(0)
  }, [])

  return { supported, needsExplicitPermission, permissionState, requestPermission, headingDelta, calibrate }
}
