module.exports = {
	apps: [
		{
			name: 'eff93-web',
			script: './build/index.js',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
				HOST: '0.0.0.0',
				ORIGIN: 'https://effervescence93.fr',
				VITE_API_URL: 'https://api.effervescence93.fr',
				BODY_SIZE_LIMIT: 10485760,
			},
		},
	],
};
