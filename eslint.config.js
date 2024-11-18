const typescriptParser = require('@typescript-eslint/parser');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // TypeScript files configuration
  {
    files: ['**/*.{ts,tsx}'], // Lint TypeScript files only
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // JavaScript files configuration
  {
    files: ['**/*.{js,jsx}'], // Apply only to JavaScript files
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      // Your JavaScript-specific rules here
    },
  },
  // Ignore specific configuration files
  {
    ignores: [
      'postcss.config.js',
      'tailwind.config.js',
      '*.config.js', // Ignore all config files ending with .config.js
      'node_modules/**',
    ],
  },
];
