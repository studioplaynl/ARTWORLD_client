module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
    'plugin:svelte/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint', // add the TypeScript plugin
  ],
  rules: {
    'linebreak-style': 0,
    'import/first': 0,
    'max-len': ['error', { code: 120 }],
    'no-multiple-empty-lines': 'off',
    'no-plusplus': 'off',
  },
  overrides: [ // this stays the same
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
    },
  ],
  settings: {
    'svelte3/typescript': true, // load TypeScript as peer dependency
  },
};
