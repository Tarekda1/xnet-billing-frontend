// workspace/front/.eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'], // Path to the root configuration
  env: {
    browser: true, // Specific to the front-end project
    es2021: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/consistent-type-assertions': 'off',
    'comma-dangle': ['error', 'only-multiline'],
  },
};
