import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false,
			envPrefix: '',
		}),
		alias: {
			$lib: './src/lib',
			'$lib/*': './src/lib/*',
			'@components': './src/lib/components',
			'@components/*': './src/lib/components/*',
			'@api': './src/lib/api',
			'@api/*': './src/lib/api/*',
			'@stores': './src/lib/stores',
			'@stores/*': './src/lib/stores/*',
			'@types': './src/lib/types',
			'@types/*': './src/lib/types/*',
			'@utils': './src/lib/utils',
			'@utils/*': './src/lib/utils/*',
		},
	},
};

export default config;
