import type { Problem, Submission } from '@algoledger/schemas'

export const ALGOLEDGER_MESSAGE_SOURCE = 'algoledger' as const

export interface AcceptedSubmissionMessage {
  source: typeof ALGOLEDGER_MESSAGE_SOURCE
  submission: Submission
  problem: Problem
}

export function isAcceptedSubmissionMessage(value: unknown): value is AcceptedSubmissionMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'source' in value &&
    (value as { source: unknown }).source === ALGOLEDGER_MESSAGE_SOURCE
  )
}
