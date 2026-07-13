import { EMPTY_NAME_INDEX, type NameIndex } from '@algoledger/generators'

export function safeParseJson(content: string): unknown {
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

export function toNameIndex(parsed: unknown): NameIndex {
  return parsed && typeof parsed === 'object'
    ? { ...EMPTY_NAME_INDEX, ...parsed }
    : EMPTY_NAME_INDEX
}
