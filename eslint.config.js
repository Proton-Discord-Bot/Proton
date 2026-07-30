import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist', 'node_modules', 'src/db/migrations', '**/*.js', '**/*.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Test doubles and fixtures use lightweight `any` stubs; production code stays strict.
    files: ['**/*.test.ts', '**/__fixtures__/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
];
