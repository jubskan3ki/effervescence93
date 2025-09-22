import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__PUBLIC_API_URL__: JSON.stringify(process.env.PUBLIC_API_URL || 'http://localhost:8080'),
	},
	resolve: {
		alias: {
			'@lib': path.resolve('./src/lib'),
			'@api': path.resolve('./src/lib/api'),
			'@stores': path.resolve('./src/lib/stores'),
			'@components': path.resolve('./src/lib/components'),
		},
	},
});
