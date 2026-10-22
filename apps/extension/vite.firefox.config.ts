import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Firefox / Gecko build — UI pages only (popup, options, onboarding).
 *
 * Background and content scripts are built separately as IIFEs by
 * vite.firefox.bg.config.ts and vite.firefox.cs.config.ts so they run in
 * non-module script contexts (Firefox MV3 background event pages and content
 * scripts do not guarantee module support across all Gecko versions).
 *
 * Output: dist-firefox/
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // injected.js is handled by a separate pre-build step; icons are copied by
  // the manifest script.  Do not copy public/ here.
  publicDir: false,

  build: {
    outDir: 'dist-firefox',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html',
        onboarding: 'src/onboarding/index.html',
      },
      output: {
        // Keep chunk names stable so the manifest script can reference them.
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})

