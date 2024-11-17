// workspace/front/.eslintrc.js
module.exports = {
  extends: ['../../.eslintrc.cjs'], // Path to the root configuration
  env: {
    browser: true, // Specific to the front-end project
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/consistent-type-assertions': 'off',
    'comma-dangle': ['error', 'only-multiline'],
  },
};
