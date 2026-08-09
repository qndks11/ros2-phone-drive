import { useCallback, useRef, useState } from 'react'

export function Pedal({ label, color, onActiveChange }) {
  const [pressed, setPressed] = useState(false)
  const pointerIdRef = useRef(null)

  const setActive = useCallback(
    (active) => {
      setPressed(active)
      onActiveChange(active)
    },
    [onActiveChange],
  )

  const handlePointerDown = (event) => {
    event.preventDefault()
    pointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    setActive(true)
  }

  const handlePointerUp = (event) => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerIdRef.current = null
    setActive(false)
  }

  return (
    <button
      type="button"
      className={`pedal pedal--${color}${pressed ? ' pedal--pressed' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  )
}
