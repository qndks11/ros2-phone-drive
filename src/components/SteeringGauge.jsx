const RAD_TO_DEG = 180 / Math.PI

export function SteeringGauge({
  steeringAngle,
  rollDelta,
  needsExplicitPermission,
  permissionState,
  onRequestPermission,
  onCalibrate,
}) {
  const degrees = steeringAngle * RAD_TO_DEG

  return (
    <div className="steering-gauge">
      <div className="steering-gauge__dial">
        <div className="steering-gauge__needle" style={{ transform: `rotate(${degrees}deg)` }} />
      </div>
      <div className="steering-gauge__readout">
        {degrees.toFixed(1)}&deg; steer (roll {rollDelta.toFixed(1)}&deg;)
      </div>
      <div className="steering-gauge__actions">
        {needsExplicitPermission && permissionState !== 'granted' && (
          <button type="button" onClick={onRequestPermission}>
            Enable Motion
          </button>
        )}
        <button type="button" onClick={onCalibrate} disabled={permissionState !== 'granted'}>
          Calibrate Center
        </button>
      </div>
    </div>
  )
}
