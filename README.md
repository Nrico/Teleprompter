# Teleprompter

This repository contains a simple web based teleprompter configured for use with Capacitor.

## Development

Install dependencies and run a local server:

```bash
npm install
npm run start
```

## Building for iOS

1. Make sure Capacitor is initialized and the iOS platform is added:
   ```bash
   npx cap add ios
   ```
2. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```
3. In Xcode, select a real device and press **Run** to build and deploy.

### Optional: Turn this project into a PWA

1. Add a `manifest.webmanifest` file in the `public/` directory.
2. Include a service worker and register it in `index.html`.
3. Host the contents of `public/` on a secure (HTTPS) server.

