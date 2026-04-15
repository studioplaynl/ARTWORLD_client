import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import airbnbBase from 'eslint-config-airbnb-base';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

const airbnbBaseConfig = airbnbBase;

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: ['*.js', '*.svelte'],
    ...airbnbBaseConfig,
  },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'max-len': ['error', { code: 120 }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/first': 0,
      'no-multiple-empty-lines': 'off',
      'no-plusplus': 'off',
      'no-unused-vars': 'warn',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
];
