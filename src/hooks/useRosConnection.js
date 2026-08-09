import { useCallback, useEffect, useRef, useState } from 'react'
import { RosClient } from '../ros/RosClient.js'

export function useRosConnection() {
  const clientRef = useRef(null)
  const [status, setStatus] = useState('disconnected')

  if (!clientRef.current) {
    clientRef.current = new RosClient()
  }

  useEffect(() => {
    const client = clientRef.current
    return () => client.disconnect()
  }, [])

  const connect = useCallback((url) => {
    setStatus('connecting')
    clientRef.current.connect(url, {
      onConnection: () => setStatus('connected'),
      onClose: () => setStatus('disconnected'),
      onError: () => setStatus('error'),
    })
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current.disconnect()
    setStatus('disconnected')
  }, [])

  const publishVelocity = useCallback((value) => {
    clientRef.current.publishVelocity(value)
  }, [])

  const publishSteering = useCallback((value) => {
    clientRef.current.publishSteering(value)
  }, [])

  const subscribeCamera = useCallback((onFrame) => {
    return clientRef.current.subscribeCamera(onFrame)
  }, [])

  return { status, connect, disconnect, publishVelocity, publishSteering, subscribeCamera }
}
