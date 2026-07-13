import {
  EMPTY_NAME_INDEX,
  EMPTY_PROBLEM_INDEX,
  type NameIndex,
  type ProblemIndex,
} from '@algoledger/generators'

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

export function toProblemIndex(parsed: unknown): ProblemIndex {
  return Array.isArray(parsed) ? (parsed as ProblemIndex) : EMPTY_PROBLEM_INDEX
}
