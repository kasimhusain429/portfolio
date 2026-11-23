import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.claude', '.playwright-mcp', 'scratch_puppeteer', 'design']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // `motion` is only referenced as <motion.div> (JSX member expressions are not seen by this rule)
      'no-unused-vars': ['error', { varsIgnorePattern: '^(motion|[A-Z_])', argsIgnorePattern: '^(_|[A-Z])' }],
    },
  },
  {
    // build tooling runs in Node
    files: ['vite.config.js', 'scripts/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
])
