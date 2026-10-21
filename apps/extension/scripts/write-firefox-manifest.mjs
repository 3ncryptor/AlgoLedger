#!/usr/bin/env node
/**
 * Post-build script for the Firefox extension.
 *
 * After the three Vite build passes have finished, this script:
 *
 *  1. Copies the extension icons from src/assets/icons/ into
 *     dist-firefox/src/assets/icons/ so that
 *     chrome.runtime.getURL('src/assets/icons/icon-32.png') resolves
 *     correctly at runtime (the icon path is hard-coded in TopBar.tsx).
 *
 *  2. Copies public/injected.js into dist-firefox/ so the content-script
 *     bridge can load it via chrome.runtime.getURL('injected.js').
 *
 *  3. Locates the built HTML output paths for popup, options, and onboarding
 *     inside dist-firefox/ and writes a Firefox-compatible manifest.json.
 *
 * The manifest produced here differs from the Chrome manifest in three ways:
 *  - `background` uses `scripts` (event page) instead of `service_worker`.
 *  - `browser_specific_settings.gecko` is added so Firefox assigns a stable
 *    extension UUID across restarts (required for persistent storage.local).
 *  - `use_dynamic_url` is removed from web_accessible_resources (Chrome-only).
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist-firefox')

// ── 1. Copy icons ────────────────────────────────────────────────────────────

const srcIconsDir = join(root, 'src', 'assets', 'icons')
const dstIconsDir = join(distDir, 'src', 'assets', 'icons')
mkdirSync(dstIconsDir, { recursive: true })

for (const file of readdirSync(srcIconsDir)) {
  copyFileSync(join(srcIconsDir, file), join(dstIconsDir, file))
}
console.log('✔  Copied icons →', relative(root, dstIconsDir))

// ── 2. Copy injected.js ──────────────────────────────────────────────────────

const injectedSrc = join(root, 'public', 'injected.js')
const injectedDst = join(distDir, 'injected.js')
if (!existsSync(injectedSrc)) {
  console.error('✖  public/injected.js not found — run the injected build first')
  process.exit(1)
}
copyFileSync(injectedSrc, injectedDst)
console.log('✔  Copied injected.js →', relative(root, injectedDst))

// ── 3. Locate built HTML output paths ────────────────────────────────────────
//
// Vite places popup/options/onboarding HTML under dist-firefox/src/*/index.html
// (mirroring the source paths).  The manifest references these same paths.

function findHtml(name) {
  const candidate = join(distDir, 'src', name, 'index.html')
  if (!existsSync(candidate)) {
    console.error(`✖  Expected ${relative(root, candidate)} but it was not found`)
    process.exit(1)
  }
  return `src/${name}/index.html`
}

const popupHtml = findHtml('popup')
const optionsHtml = findHtml('options')
const onboardingHtml = findHtml('onboarding')

// ── 4. Write manifest.json ───────────────────────────────────────────────────

const pkg = JSON.parse(
  (await import('node:fs')).readFileSync(join(root, 'package.json'), 'utf8'),
)

const manifest = {
  manifest_version: 3,
  name: 'AlgoLedger',
  version: pkg.version,
  description:
    'Automatically converts accepted LeetCode submissions into a structured, version-controlled GitHub knowledge repository.',

  // Gecko requires a stable ID so storage.local persists across restarts.
  browser_specific_settings: {
    gecko: {
      id: 'algoledger@local',
      strict_min_version: '128.0',
    },
  },

  icons: {
    16: 'src/assets/icons/icon-16.png',
    32: 'src/assets/icons/icon-32.png',
    48: 'src/assets/icons/icon-48.png',
    128: 'src/assets/icons/icon-128.png',
  },

  action: {
    default_popup: popupHtml,
    default_icon: {
      16: 'src/assets/icons/icon-16.png',
      32: 'src/assets/icons/icon-32.png',
      48: 'src/assets/icons/icon-48.png',
      128: 'src/assets/icons/icon-128.png',
    },
  },

  options_page: optionsHtml,

  // Firefox MV3 uses a background event page, not a service worker.
  background: {
    scripts: ['background.js'],
  },

  content_scripts: [
    {
      matches: ['https://leetcode.com/*'],
      js: ['content/bridge.js'],
      run_at: 'document_start',
    },
  ],

  // `use_dynamic_url` is Chrome-only and must be omitted for Firefox.
  web_accessible_resources: [
    {
      resources: ['injected.js'],
      matches: ['https://leetcode.com/*'],
    },
  ],

  permissions: ['storage', 'activeTab', 'scripting', 'alarms', 'notifications'],
  host_permissions: [
    'https://leetcode.com/*',
    'https://api.github.com/*',
    'https://github.com/*',
  ],
}

writeFileSync(join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log('✔  Wrote manifest.json')
console.log('\n🦊  Firefox build complete →', relative(root, distDir))

