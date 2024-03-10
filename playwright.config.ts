import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	projects: [
		{
			name: 'Chrome',
			use: { browserName: 'chromium' }
		},
		{
			name: 'Firefox',
			use: { browserName: 'firefox' }
		},
		{
			name: 'WebKit',
			use: { browserName: 'webkit' }
		}
	]
};

export default config;
