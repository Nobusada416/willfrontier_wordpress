// @ts-check
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    // WordPress テーマ（移行完了まで残す既存ファイル）と生成物は対象外
    ignores: [
      'assets/**',
      'data/**',
      'docker/**',
      'scripts/**',
      'static/**',
      'src/**',
      '.wrangler/**',
      'tailwind.config.js',
      '**/node_modules/**',
      '**/build/**',
      '**/lib/**',
      '**/.react-router/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['web/app/**/*.{ts,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: globals.browser,
    },
  },
  {
    files: ['web/app/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['**/*.{js,mjs,ts}'],
    ignores: ['web/app/**'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  prettier,
)
