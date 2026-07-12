function shieldsEncode(text: string): string {
  return text.replace(/-/g, '--').replace(/_/g, '__').replace(/ /g, '_')
}

export function badge(label: string, message: string, color: string): string {
  return `![${label}](https://img.shields.io/badge/${shieldsEncode(label)}-${shieldsEncode(message)}-${color})`
}
