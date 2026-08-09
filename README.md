# ros2-phone-drive

A mobile web app for driving a ROS2 vehicle from a phone: on-screen accelerator/brake
pedals plus phone-yaw steering, published over [rosbridge](https://github.com/RobotWebTools/rosbridge_suite)
via [roslibjs](https://github.com/RobotWebTools/roslibjs).

- Publishes `std_msgs/Float64` on `/velocity` (accel/brake) and `/steering_angle` (phone yaw).
- Rosbridge URL, max velocity, max steering angle, and steering sensitivity are all
  configurable in-app (persisted to `localStorage`).

## Requirements

- Node.js 20+ (the system `apt` package may install an older Node; if so, use [nvm](https://github.com/nvm-sh/nvm) to install 20:
  `nvm install 20 && nvm use 20`)

## Setup

```sh
npm install
```

## Running the Server

### Development server

Starts Vite's dev server with hot module reloading:

```sh
npm run dev
```

By default this serves the app at [http://localhost:5173](http://localhost:5173). Press `Ctrl+C` to stop it.

The dev server is also bound to your LAN (`server.host: true`) and served over a
self-signed HTTPS certificate (`@vitejs/plugin-basic-ssl`), so it prints a
`https://<your-LAN-IP>:5173` URL too — open that on the phone. HTTPS is required here
because phones only expose orientation/motion sensors to secure (`https://`) origins;
you'll need to accept the browser's self-signed certificate warning once.

### Driving the vehicle

1. On the machine running ROS2, start rosbridge's websocket server:

   ```sh
   ros2 launch rosbridge_server rosbridge_websocket_launch.xml
   ```

   By default it listens on port `9090`.
2. Open the `https://<LAN-IP>:5173` URL from the phone (same Wi-Fi network as the ROS2 machine).
3. In Settings, set the Rosbridge URL to `ws://<ROS2-machine-IP>:9090` and tap Connect.
4. Tap **Enable Motion** (iOS only) to grant orientation sensor access, hold the phone
   the way you want "straight ahead" to be, then tap **Calibrate Center**.
5. Hold the phone in landscape and use the on-screen **BRAKE** / **ACCEL** pedals; yaw
   (rotate) the phone left/right to steer. The **STOP** button immediately zeroes velocity.

### Production build

Bundles the app into the `dist/` directory:

```sh
npm run build
```

### Preview the production build

Serves the contents of `dist/` locally so you can sanity-check the production build:

```sh
npm run preview
```

This serves the app at [http://localhost:4173](http://localhost:4173) by default.
