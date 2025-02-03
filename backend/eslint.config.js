import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
	stylistic.configs.customize({
		flat: true,
		indent: 'tab',
		quotes: 'single',
		jsx: false,
	}),
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		ignores: [
			'dist',
			'node_modules',
			'eslint.config.js',
			'jest.config.ts',
		],
		extends: [
			pluginJs.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			ecmaVersion: 2023,
			globals: globals.node,
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/no-extra-semi': 'off',
			'@typescript-eslint/consistent-type-definitions': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
		},
	},
	eslintConfigPrettier,
);
