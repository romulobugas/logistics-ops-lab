module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '@nestjs/eslint-config-nestjs',
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    'prefer-const': 'error',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
