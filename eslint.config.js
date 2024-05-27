import js from '@eslint/js';
import svelte3 from 'eslint-plugin-svelte3';
import airbnbBase from 'eslint-config-airbnb-base';
import importPlugin from 'eslint-plugin-import';

const airbnbBaseConfig = airbnbBase;

export default [
  js.configs.recommended,
  {
    files: ['*.js', '*.svelte'],
    ...airbnbBaseConfig,
  },
  {
    files: ['*.svelte'],
    processor: svelte3.processors.svelte3,
  },
  {
    plugins: {
      svelte3,
      import: importPlugin,
    },
    rules: {
      'max-len': ['error', { code: 120 }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
    settings: {
      'svelte3/ignore-styles': () => true,
    },
    languageOptions: {
      globals: {
        browser: true,
        node: true,
        es6: true,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
];
