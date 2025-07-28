import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycompany.teleprompter',
  appName: 'Teleprompter',
  webDir: 'public',
  bundledWebRuntime: false,
  ios: {
    plist: {
      NSCameraUsageDescription: 'Camera access is required for recording video',
      NSMicrophoneUsageDescription: 'Microphone access is required for recording audio',
      NSPhotoLibraryAddUsageDescription: 'Photo library access is required to save recordings'
    }
  }
};

export default config;
