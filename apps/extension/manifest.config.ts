import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'AlgoLedger',
  version: packageJson.version,
  description:
    'Automatically converts accepted LeetCode submissions into a structured, version-controlled GitHub knowledge repository.',
  action: {
    default_popup: 'src/popup/index.html',
  },
  options_page: 'src/options/index.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://leetcode.com/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_start',
    },
  ],
  web_accessible_resources: [
    {
      resources: ['injected.js'],
      matches: ['https://leetcode.com/*'],
    },
  ],
  permissions: ['storage', 'activeTab', 'scripting', 'alarms', 'notifications'],
  host_permissions: ['https://leetcode.com/*', 'https://api.github.com/*', 'https://github.com/*'],
})
