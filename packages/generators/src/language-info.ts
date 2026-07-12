export interface LanguageInfo {
  extension: string
  commentPrefix: string
}

const LANGUAGE_MAP: Record<string, LanguageInfo> = {
  cpp: { extension: 'cpp', commentPrefix: '//' },
  java: { extension: 'java', commentPrefix: '//' },
  python3: { extension: 'py', commentPrefix: '#' },
  python: { extension: 'py', commentPrefix: '#' },
  pythondata: { extension: 'py', commentPrefix: '#' },
  javascript: { extension: 'js', commentPrefix: '//' },
  typescript: { extension: 'ts', commentPrefix: '//' },
  vanillajs: { extension: 'js', commentPrefix: '//' },
  react: { extension: 'jsx', commentPrefix: '//' },
  csharp: { extension: 'cs', commentPrefix: '//' },
  c: { extension: 'c', commentPrefix: '//' },
  golang: { extension: 'go', commentPrefix: '//' },
  kotlin: { extension: 'kt', commentPrefix: '//' },
  swift: { extension: 'swift', commentPrefix: '//' },
  rust: { extension: 'rs', commentPrefix: '//' },
  ruby: { extension: 'rb', commentPrefix: '#' },
  php: { extension: 'php', commentPrefix: '//' },
  dart: { extension: 'dart', commentPrefix: '//' },
  scala: { extension: 'scala', commentPrefix: '//' },
  elixir: { extension: 'ex', commentPrefix: '#' },
  erlang: { extension: 'erl', commentPrefix: '%' },
  racket: { extension: 'rkt', commentPrefix: ';' },
  bash: { extension: 'sh', commentPrefix: '#' },
  mysql: { extension: 'sql', commentPrefix: '--' },
  mssql: { extension: 'sql', commentPrefix: '--' },
  postgresql: { extension: 'sql', commentPrefix: '--' },
  oraclesql: { extension: 'sql', commentPrefix: '--' },
}

const DEFAULT_LANGUAGE_INFO: LanguageInfo = { extension: 'txt', commentPrefix: '#' }

export function getLanguageInfo(language: string): LanguageInfo {
  return LANGUAGE_MAP[language] ?? DEFAULT_LANGUAGE_INFO
}
