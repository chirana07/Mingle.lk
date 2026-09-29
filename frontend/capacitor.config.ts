import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lk.mingle.katha',
  appName: 'Katha (Mingle.lk)',
  webDir: 'out',
  server: {
    // For live-reloading during mobile app testing on local network,
    // uncomment and point to your dev machine's local IP:
    // url: 'http://192.168.1.X:3000',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#020617',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617',
    }
  }
};

export default config;
