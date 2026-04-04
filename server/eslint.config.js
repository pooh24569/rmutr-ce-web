import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules', 'coverage', 'logs', 'uploads'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // ใช้ "warn" แทน "error" เพื่อไม่ให้ block การทำงาน
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'warn',
      'eqeqeq': ['warn', 'always'],
    },
  },
  prettierConfig,
];
