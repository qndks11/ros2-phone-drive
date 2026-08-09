import { useCallback, useEffect, useState } from 'react'

export function useFullscreen() {
  const supported = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen

  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && !!document.fullscreenElement,
  )

  useEffect(() => {
    if (!supported) return undefined
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [supported])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  return { isFullscreen, toggle, supported }
}
