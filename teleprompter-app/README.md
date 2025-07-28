# Teleprompter Capacitor App

This project packages the browser-based teleprompter into a Capacitor application for iOS devices.

## Setup

```bash
cd teleprompter-app
npm install
```

## Development

Start a local server to view the app in a browser:

```bash
npm start
```

There is no build step for this simple app but the script is kept for future needs:

```bash
npm run build
```

## iOS

Add the iOS platform and open the project in Xcode:

```bash
npx cap sync ios
npm run ios
```

### Testing on Real Hardware

1. Connect your iPhone or iPad with a USB cable.
2. In Xcode, select your device in the target dropdown.
3. Press the **Run** button to install and launch the app on the device.
4. Ensure camera and microphone permissions are accepted when prompted.

## Service Worker

A basic `service-worker.js` is included so the project can later be expanded to a Progressive Web App.

## Permissions

Camera, microphone and photo library permissions are automatically added to the iOS `Info.plist` via `capacitor.config.ts`.

## Voice Tracking Modes

The app can optionally track your voice while scrolling. Use the **Voice Tracking**
dropdown in the control panel to select between three modes:

1. **None** – no speech recognition is performed.
2. **Web Speech** – uses the browser's built-in Web Speech API.
3. **iOS Plugin** – uses the custom Capacitor plugin located in `SpeechRecognizer/ios`.

Voice recognition begins when you press **Start** and stops when you hit **Stop**.
