// AI-generated code
// Create ESLint configuration for React TypeScript frontend

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'import', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/naming-convention': [
  'error',
  {
    selector: 'default',
    format: ['snake_case'],
  },
  {
    selector: 'variable',
    format: ['snake_case'],
  },
  {
    selector: 'function',
    format: ['snake_case'],
  },
  {
    selector: 'parameter',
    format: ['snake_case'],
  },
  {
    selector: 'property',
    modifiers: ['public'],
    format: ['snake_case'],
  },
  {
    selector: 'typeLike', // class, interface, typeAlias, enum, etc.
    format: ['PascalCase'], 
  },
  ],
  '@typescript-eslint/no-unused-vars': ['warn'],
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    ],
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};
