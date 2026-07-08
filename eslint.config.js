import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error', // use the Fastify logger; protects against accidental token/PII logging
    },
  },
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
);
