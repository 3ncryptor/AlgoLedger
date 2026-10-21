import { defineConfig } from 'vite'

/**
 * Builds the background event-page script for Firefox as a self-contained IIFE.
 *
 * Firefox MV3 background scripts run as regular (non-module) scripts in an
 * event-page context.  Building as IIFE means every import is bundled inline
 * and there are no bare `import` statements that would fail in that context.
 *
 * Output: dist-firefox/background.js
 */
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist-firefox',
    emptyOutDir: false, // UI pages were already written; don't wipe them
    lib: {
      entry: 'src/background/index.ts',
      formats: ['iife'],
      name: 'AlgoLedgerBackground',
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        // Inline all dynamic imports so the single IIFE file is truly self-contained.
        inlineDynamicImports: true,
      },
    },
  },
})

