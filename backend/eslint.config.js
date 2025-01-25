import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
	stylistic.configs.customize({
		flat: true,
		indent: 'tab',
		quotes: 'single',
		jsx: false,
	}),
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: { globals: globals.browser },
		rules: {
			'@typescript-eslint/no-extra-semi': 'off',
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	eslintConfigPrettier,
];
