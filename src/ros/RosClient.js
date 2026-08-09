import { Ros, Topic } from 'roslib'

export class RosClient {
  constructor() {
    this.ros = null
    this.velocityTopic = null
    this.steeringTopic = null
    this.cameraTopic = null
  }

  connect(url, { onConnection, onClose, onError } = {}) {
    this.disconnect()

    const ros = new Ros({ url })
    this.ros = ros

    ros.on('connection', () => onConnection?.())
    ros.on('close', () => onClose?.())
    ros.on('error', (err) => onError?.(err))

    this.velocityTopic = new Topic({
      ros,
      name: '/velocity',
      messageType: 'std_msgs/msg/Float64',
    })

    this.steeringTopic = new Topic({
      ros,
      name: '/steering_angle',
      messageType: 'std_msgs/msg/Float64',
    })

    this.cameraTopic = new Topic({
      ros,
      name: '/camera/image_raw/compressed',
      messageType: 'sensor_msgs/msg/CompressedImage',
    })
  }

  disconnect() {
    this.ros?.close()
    this.ros = null
    this.velocityTopic = null
    this.steeringTopic = null
    this.cameraTopic = null
  }

  // Returns an unsubscribe function. No-op if not currently connected.
  subscribeCamera(onFrame) {
    const topic = this.cameraTopic
    if (!topic) return () => {}
    topic.subscribe(onFrame)
    return () => topic.unsubscribe(onFrame)
  }

  publishVelocity(value) {
    this.velocityTopic?.publish({ data: value })
  }

  publishSteering(value) {
    this.steeringTopic?.publish({ data: value })
  }
}
