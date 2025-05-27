import { defineConfig } from 'eslint/config';
import neostandard from 'neostandard';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    ignores: [
      'convex/_generated',
      '**/node_modules',
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*'
    ]
  },
  ...neostandard({
    ts: true,
    semi: true
  }),
  eslintPluginPrettierRecommended
]);
