import { defineConfig } from 'vite'

// injected.js runs inside the LeetCode page itself (MAIN world), loaded via a raw <script> tag
// from chrome-extension://. Anything it imports must either be inlined or listed in
// web_accessible_resources. Building it in the same Rollup graph as popup/options/onboarding lets
// Vite hoist shared dependencies (e.g. @algoledger/schemas) into separate chunks that aren't
// web-accessible, silently breaking the page-side script. A dedicated library-mode build with a
// single IIFE output has no chunks to share in the first place.
//
// Output goes to public/ (not dist/) and runs BEFORE the main build: CRXJS's manifest plugin
// validates every web_accessible_resources entry exists as a real file (project root or public
// dir) at manifest-processing time — it can't reference an asset from a separate, later build
// pass into dist/. Vite's main build then copies public/injected.js into dist/injected.js as
// part of its normal "copy public dir into outDir" step.
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'public',
    emptyOutDir: false,
    lib: {
      entry: 'src/injected/index.ts',
      formats: ['iife'],
      name: 'AlgoLedgerInjected',
      fileName: () => 'injected.js',
    },
  },
})
