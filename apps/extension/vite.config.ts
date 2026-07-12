import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        injected: 'src/injected/index.ts',
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === 'injected' ? 'injected.js' : 'assets/[name]-[hash].js',
      },
    },
  },
})
