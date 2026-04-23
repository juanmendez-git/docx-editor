import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const monorepoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [vue()],
  root: __dirname,
  resolve: {
    alias: [
      {
        find: '@juanmendez90/docx-editor-vue',
        replacement: path.join(monorepoRoot, 'packages/vue/src/index.ts'),
      },
      {
        find: '@juanmendez90/docx-core/headless',
        replacement: path.join(monorepoRoot, 'packages/core/src/headless.ts'),
      },
      {
        find: '@juanmendez90/docx-core/core-plugins',
        replacement: path.join(monorepoRoot, 'packages/core/src/core-plugins/index.ts'),
      },
      // Wildcard alias for deep core imports
      {
        find: /^@juanmendez90\/docx-core\/(.+)/,
        replacement: path.join(monorepoRoot, 'packages/core/src/$1'),
      },
      // Exact match for bare @juanmendez90/docx-core (must come AFTER prefix match)
      {
        find: /^@juanmendez90\/docx-core$/,
        replacement: path.join(monorepoRoot, 'packages/core/src/core.ts'),
      },
    ],
  },
  server: {
    port: 5174,
    open: false,
  },
  build: {
    outDir: 'dist',
  },
});
