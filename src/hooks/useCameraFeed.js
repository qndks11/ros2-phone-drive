import { useEffect, useRef } from 'react'

function decodeBase64(data) {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// Subscribes to the compressed camera topic while `active` and paints
// frames straight to a canvas via ref, bypassing React state so frame
// arrival never triggers a re-render.
export function useCameraFeed(subscribeCamera, active) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined
    return subscribeCamera(async (msg) => {
      const mime = msg.format?.includes('png') ? 'image/png' : 'image/jpeg'
      const blob = new Blob([decodeBase64(msg.data)], { type: mime })
      const bitmap = await createImageBitmap(blob)

      const canvas = canvasRef.current
      if (canvas) {
        if (canvas.width !== bitmap.width) canvas.width = bitmap.width
        if (canvas.height !== bitmap.height) canvas.height = bitmap.height
        canvas.getContext('2d').drawImage(bitmap, 0, 0)
      }
      bitmap.close()
    })
  }, [subscribeCamera, active])

  return canvasRef
}
