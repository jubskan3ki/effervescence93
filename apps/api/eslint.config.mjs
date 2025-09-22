import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

/**
 * On s’aligne sur ta façon de faire:
 * - flat config
 * - parserOptions projet dédié (tsconfig.eslint.json)
 * - alias @app, @modules, @common
 * - règles import/ordre + prettier en "error"
 */

const parserOptionsWithTypes = {
	project: './tsconfig.eslint.json',
	tsconfigRootDir: process.cwd(),
	ecmaVersion: 'latest',
	sourceType: 'module',
};

export default [
	{
		ignores: [
			'dist/**/*',
			'node_modules/**/*',
			'coverage/**/*',
			'**/*.config.{js,ts}',
			'**/prisma/**/*', // optionnel: ignore si tu ne veux pas linter les .ts dans prisma/
		],
	},

	// Base JS/TS (commune)
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tsParser,
			parserOptions: parserOptionsWithTypes,
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
						['@app', './src'],
						['@modules', './src/modules'],
						['@common', './src/common'],
					],
					extensions: ['.ts', '.js', '.json'],
				},
				node: { extensions: ['.js', '.ts', '.d.ts', '.json'] },
			},
		},
		rules: {
			// Prettier en "error" (comme chez toi)
			'prettier/prettier': 'error',

			// Hygiène générale
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
			// pas d’extensions sur TS/JS; (tu forçais .vue:always – retiré ici)
			'import/extensions': [
				'error',
				'ignorePackages',
				{
					js: 'never',
					ts: 'never',
					json: 'always',
				},
			],
			'import/order': [
				'warn',
				{
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
					pathGroups: [
						// blocs internes pour sauts de ligne visuels entre alias
						{ pattern: '@common/**', group: 'internal', position: 'before' },
						{ pattern: '@modules/**', group: 'internal', position: 'before' },
						{ pattern: '@app/**', group: 'internal', position: 'after' },
					],
					pathGroupsExcludedImportTypes: ['builtin'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],

			// TS strict utile pour Nest
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
];
