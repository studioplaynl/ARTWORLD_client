module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  plugins: [
    'svelte3',
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
      processor: 'svelte3/svelte3',
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'import/no-mutable-exports': 0,
        'import/prefer-default-export': 0,
        'no-labels': 0,
        'no-restricted-syntax': 0,
      },
    },
  ],
  settings: {
    'svelte3/typescript': true, // load TypeScript as peer dependency
  },
};
