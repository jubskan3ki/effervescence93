// apps/web/svelte.config.js
import adapter from '@sveltejs/adapter-node';
import { resolve } from 'path';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@components': resolve('src/lib/components'),
			'@lib': resolve('src/lib'),
			'@stores': resolve('src/lib/stores'),
			'@api': resolve('src/lib/api'),
		},
	},
};

export default config;
