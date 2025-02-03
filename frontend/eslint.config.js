import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintReactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
	stylistic.configs.customize({
		flat: true,
		indent: 'tab',
		quotes: 'single',
		jsx: true,
	}),
	{
		ignores: [
			'dist',
			'node_modules',
			'vite.config.ts',
			'tsconfig.ts',
			'eslint.config.js',
			'jest.*.ts',
		],
		extends: [
			pluginJs.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		files: ['**/*.{ts,tsx,js}'],
		languageOptions: {
			ecmaVersion: 2023,
			globals: globals.browser,
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			react: {
				version: '19',
			},
		},
		plugins: {
			'react': eslintReact,
			'react-hooks': eslintReactHooks,
			'react-refresh': eslintReactRefresh,
		},
		rules: {
			...eslintReactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			...eslintReact.configs.recommended.rules,
			...eslintReact.configs['jsx-runtime'].rules,
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
			'@typescript-eslint/consistent-type-definitions': 'warn',
		},
	},
	eslintConfigPrettier
);
