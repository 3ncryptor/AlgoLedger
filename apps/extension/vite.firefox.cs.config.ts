import { defineConfig } from 'vite'

/**
 * Builds the content script (bridge.ts) for Firefox as a self-contained IIFE.
 *
 * Content scripts in Firefox do not support `type: "module"`, so the script
 * must be a plain script with no ES module syntax.  Building as IIFE bundles
 * every import inline and produces a single file with no top-level imports.
 *
 * Output: dist-firefox/content/bridge.js
 */
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist-firefox',
    emptyOutDir: false,
    lib: {
      entry: 'src/content/bridge.ts',
      formats: ['iife'],
      name: 'AlgoLedgerBridge',
      fileName: () => 'content/bridge.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})

