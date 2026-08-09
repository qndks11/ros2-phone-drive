import { useRosConnection } from './hooks/useRosConnection.js'
import { useDeviceOrientation } from './hooks/useDeviceOrientation.js'
import { useSettings } from './hooks/useSettings.js'
import { useCameraFeed } from './hooks/useCameraFeed.js'
import { useFullscreen } from './hooks/useFullscreen.js'
import { useControlLoop } from './control/useControlLoop.js'
import { Pedal } from './components/Pedal.jsx'
import { SteeringGauge } from './components/SteeringGauge.jsx'
import { SettingsPanel } from './components/SettingsPanel.jsx'
import { CameraView } from './components/CameraView.jsx'

function App() {
  const { settings, updateSetting } = useSettings()
  const { status, connect, disconnect, publishVelocity, publishSteering, subscribeCamera } =
    useRosConnection()
  const orientation = useDeviceOrientation()
  const cameraCanvasRef = useCameraFeed(subscribeCamera, status === 'connected')
  const { isFullscreen, toggle: toggleFullscreen, supported: fullscreenSupported } = useFullscreen()

  const { velocity, steeringAngle, setAccel, setBrake, stop } = useControlLoop({
    connected: status === 'connected',
    publishVelocity,
    publishSteering,
    maxVelocity: settings.maxVelocity,
    maxSteeringAngle: settings.maxSteeringAngle,
    fullLockDegrees: settings.fullLockDegrees,
    rollDelta: orientation.rollDelta,
  })

  return (
    <div className="app">
      <CameraView canvasRef={cameraCanvasRef} />
      {fullscreenSupported && (
        <button
          type="button"
          className="fullscreen-button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⤡' : '⛶'}
        </button>
      )}
      <div className="app__header">
        <SettingsPanel
          settings={settings}
          onChange={updateSetting}
          status={status}
          onConnect={connect}
          onDisconnect={disconnect}
        />
        <SteeringGauge
          steeringAngle={steeringAngle}
          rollDelta={orientation.rollDelta}
          needsExplicitPermission={orientation.needsExplicitPermission}
          permissionState={orientation.permissionState}
          onRequestPermission={orientation.requestPermission}
          onCalibrate={orientation.calibrate}
        />
        <div className="readout">Velocity: {velocity.toFixed(2)} m/s</div>
      </div>

      <div className="pedals">
        <Pedal label="BRAKE" color="brake" onActiveChange={setBrake} />
        <button type="button" className="stop-button" onClick={stop}>
          STOP
        </button>
        <Pedal label="ACCEL" color="accel" onActiveChange={setAccel} />
      </div>
    </div>
  )
}

export default App
