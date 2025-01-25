import js from '@eslint/js';
import globals from 'globals';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintReactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

export default [
	stylistic.configs.customize({
		flat: true,
		indent: 'tab',
		quotes: 'single',
		jsx: true,
	}),
	tseslint.config({
		ignores: ['dist'],
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		files: ['**/*.{ts,tsx,js}'],
		languageOptions: {
			ecmaVersion: 2023,
			globals: globals.browser,
			parserOptions: {
				project: ['./tsconfig.app.json', './tsconfig.node.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			react: {
				version: '18.3',
			},
		},
		plugins: {
			'eslint-react': eslintReact,
			'react-hooks': eslintReactHooks,
			'react-refresh': eslintReactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			...eslintReact.configs.recommended.rules,
			...eslintReact.configs['jsx-runtime'].rules,
		},
	}),
	eslintConfigPrettier,
];
