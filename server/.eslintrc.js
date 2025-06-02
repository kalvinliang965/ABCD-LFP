const js = require('@eslint/js');
const parser = require('@typescript-eslint/parser');
const plugin = require('@typescript-eslint/eslint-plugin');

// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
  },
};
