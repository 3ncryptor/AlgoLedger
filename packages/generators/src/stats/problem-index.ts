import type { Difficulty } from '@algoledger/shared'

export interface ProblemIndexEntry {
  folderId: string
  frontendId: string
  title: string
  slug: string
  difficulty: Difficulty
  topics: string[]
  language: string
  acceptedAt: string
}

export type ProblemIndex = ProblemIndexEntry[]

export const EMPTY_PROBLEM_INDEX: ProblemIndex = []

export function upsertProblemIndexEntry(
  index: ProblemIndex,
  entry: ProblemIndexEntry,
): ProblemIndex {
  const existingPosition = index.findIndex((item) => item.folderId === entry.folderId)
  if (existingPosition === -1) return [...index, entry]

  const next = [...index]
  next[existingPosition] = entry
  return next
}
