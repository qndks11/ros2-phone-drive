import { useCallback, useEffect, useRef, useState } from 'react'

const PUBLISH_HZ = 20
const ACCEL_TIME_TO_MAX = 2 // seconds to reach maxVelocity from 0 under accel
const BRAKE_TIME_TO_ZERO = 1 // seconds to reach 0 from maxVelocity under brake
const COAST_TIME_TO_ZERO = 4 // seconds to coast to 0 with no pedal held

// Owns the accel/brake ramp and roll-to-steering mapping, and publishes both
// at a fixed rate over ROS. Pedal state and settings are read from refs each
// frame so the rAF loop can stay mounted for the app's whole lifetime.
export function useControlLoop({
  connected,
  publishVelocity,
  publishSteering,
  maxVelocity,
  maxSteeringAngle,
  fullLockDegrees,
  rollDelta,
}) {
  const [velocity, setVelocity] = useState(0)
  const [steeringAngle, setSteeringAngle] = useState(0)

  const accelActiveRef = useRef(false)
  const brakeActiveRef = useRef(false)
  const stoppedRef = useRef(false)
  const velocityRef = useRef(0)

  const rollDeltaRef = useRef(rollDelta)
  rollDeltaRef.current = rollDelta
  const maxVelocityRef = useRef(maxVelocity)
  maxVelocityRef.current = maxVelocity
  const maxSteeringAngleRef = useRef(maxSteeringAngle)
  maxSteeringAngleRef.current = maxSteeringAngle
  const fullLockDegreesRef = useRef(fullLockDegrees)
  fullLockDegreesRef.current = fullLockDegrees
  const connectedRef = useRef(connected)
  connectedRef.current = connected

  useEffect(() => {
    let rafId
    let lastTime = performance.now()
    let sincePublish = 0

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const maxV = maxVelocityRef.current
      if (stoppedRef.current) {
        if (!accelActiveRef.current) stoppedRef.current = false
        velocityRef.current = 0
      } else if (brakeActiveRef.current) {
        velocityRef.current = Math.max(0, velocityRef.current - (maxV / BRAKE_TIME_TO_ZERO) * dt)
      } else if (accelActiveRef.current) {
        velocityRef.current = Math.min(maxV, velocityRef.current + (maxV / ACCEL_TIME_TO_MAX) * dt)
      } else {
        velocityRef.current = Math.max(0, velocityRef.current - (maxV / COAST_TIME_TO_ZERO) * dt)
      }

      const fullLock = fullLockDegreesRef.current || 1
      const clampedDelta = Math.max(-fullLock, Math.min(fullLock, rollDeltaRef.current))
      // Positive published steering_angle follows the standard ROS convention
      // (REP103, right-hand rule about z) and means a left turn, and a
      // positive rollDelta means the phone was tilted clockwise (right),
      // so tilting right maps to a left turn (flipped from the physical tilt).
      const steering = (clampedDelta / fullLock) * maxSteeringAngleRef.current

      sincePublish += dt
      if (sincePublish >= 1 / PUBLISH_HZ) {
        sincePublish = 0
        setVelocity(velocityRef.current)
        setSteeringAngle(steering)
        if (connectedRef.current) {
          publishVelocity(velocityRef.current)
          publishSteering(steering)
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [publishVelocity, publishSteering])

  useEffect(() => {
    if (!connected) {
      velocityRef.current = 0
      setVelocity(0)
    }
  }, [connected])

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) return
      velocityRef.current = 0
      setVelocity(0)
      if (connectedRef.current) publishVelocity(0)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [publishVelocity])

  const setAccel = useCallback((active) => {
    accelActiveRef.current = active
  }, [])

  const setBrake = useCallback((active) => {
    brakeActiveRef.current = active
  }, [])

  const stop = useCallback(() => {
    stoppedRef.current = true
    velocityRef.current = 0
    setVelocity(0)
    if (connectedRef.current) publishVelocity(0)
  }, [publishVelocity])

  return { velocity, steeringAngle, setAccel, setBrake, stop }
}
