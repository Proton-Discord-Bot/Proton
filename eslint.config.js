import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist', 'node_modules', 'src/db/migrations', '**/*.js', '**/*.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];
