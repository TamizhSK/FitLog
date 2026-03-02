import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'app.fitlog.workout',
	appName: 'FitLog',
	webDir: 'build',
	server: {
		// During development, load from your dev server instead of built files.
		// Uncomment and set to your local IP when running `npm run dev`:
		// url: 'http://192.168.1.X:5173',
		// cleartext: true
	}
};

export default config;
