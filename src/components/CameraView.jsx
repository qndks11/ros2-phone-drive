export function CameraView({ canvasRef }) {
  return (
    <div className="camera-view">
      <canvas ref={canvasRef} className="camera-view__canvas" />
    </div>
  )
}
