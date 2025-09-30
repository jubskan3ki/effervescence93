import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [sveltekit()],
		define: {
			__APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
		},
		optimizeDeps: {
			include: [
				'@fortawesome/fontawesome-free',
				'@tanstack/svelte-query',
				'svelte-sonner',
				'date-fns',
				'clsx',
				'zod',
			],
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						if (id.includes('node_modules')) {
							if (id.includes('@tanstack')) return 'tanstack';
							if (id.includes('date-fns') || id.includes('clsx') || id.includes('zod')) return 'utils';
							return 'vendor';
						}
					},
				},
			},
		},
		server: {
			host: true,
			port: 3000,
			strictPort: true,
		},
	};
});
