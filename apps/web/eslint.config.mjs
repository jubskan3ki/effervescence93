// apps/web/eslint.config.mjs
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

const parserOptionsWithTypes = {
	project: './tsconfig.eslint.json',
	tsconfigRootDir: process.cwd(),
	ecmaVersion: 'latest',
	sourceType: 'module',
};

export default [
	// Ignore patterns
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'coverage/**',
			'.svelte-kit/**',
			'.vite/**',
			'**/*.config.{js,cjs,mjs,ts}',
		],
	},

	// Base JS/TS
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: parserOptionsWithTypes,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				process: 'readonly',
			},
		},
		plugins: {
			prettier: prettierPlugin,
			import: importPlugin,
			'@typescript-eslint': tsPlugin,
		},
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: ['./tsconfig.eslint.json'],
				},
				alias: {
					map: [
						['@components', './src/lib/components'],
						['@lib', './src/lib'],
						['@stores', './src/lib/stores'],
						['@api', './src/lib/api'],
					],
					extensions: ['.ts', '.js', '.svelte', '.json'],
				},
				node: { extensions: ['.js', '.ts', '.d.ts', '.svelte', '.json'] },
			},
			'import/core-modules': ['$app/environment', '$app/navigation', '$app/paths', '$app/stores', '$app/forms'],
		},
		rules: {
			// Prettier
			'prettier/prettier': 'error',

			// Hygiène
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
			'no-var': 'error',
			'prefer-const': 'error',
			'prefer-arrow-callback': 'warn',
			'object-shorthand': 'warn',

			// Imports
			'import/first': 'error',
			'import/no-duplicates': 'error',
			'import/no-relative-packages': 'error',
			'import/extensions': [
				'error',
				'ignorePackages',
				{ js: 'never', ts: 'never', json: 'always', svelte: 'always' },
			],
			'import/order': [
				'warn',
				{
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
					pathGroups: [
						{ pattern: '@components/**', group: 'internal', position: 'before' },
						{ pattern: '@api/**', group: 'internal', position: 'before' },
						{ pattern: '@stores/**', group: 'internal', position: 'before' },
						{ pattern: '@lib/**', group: 'internal', position: 'after' },
					],
					pathGroupsExcludedImportTypes: ['builtin'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],

			// TS strict
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/ban-ts-comment': 'warn',
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			'@typescript-eslint/no-inferrable-types': 'warn',
			'@typescript-eslint/prefer-optional-chain': 'warn',
			'@typescript-eslint/prefer-ts-expect-error': 'error',
			'@typescript-eslint/prefer-includes': 'warn',
			'@typescript-eslint/prefer-string-starts-ends-with': 'warn',
		},
	},

	// Svelte SFC
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				...parserOptionsWithTypes,
				parser: tsParser, // <script lang="ts">
				extraFileExtensions: ['.svelte'],
			},
		},
		plugins: {
			svelte: sveltePlugin,
			prettier: prettierPlugin,
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			// Règles officielles Svelte (flat/recommended)
			...sveltePlugin.configs['flat/recommended'].rules,

			// Prettier (avec prettier-plugin-svelte)
			'prettier/prettier': 'error',

			// Ajouts Svelte sûrs (EXISTANTS)
			'svelte/no-at-html-tags': 'warn',
			'svelte/valid-compile': 'error',

			// Typescript dans <script>
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/consistent-type-imports': 'error',
		},
	},
];
