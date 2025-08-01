import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b2355b98b96a428db2f457a57442c215',
  appName: 'hexa-pos-nexus',
  webDir: 'dist',
  server: {
    url: 'https://b2355b98-b96a-428d-b2f4-57a57442c215.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      camera: 'back'
    }
  }
};

export default config;