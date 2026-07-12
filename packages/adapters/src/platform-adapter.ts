import type { Problem, Submission } from '@algoledger/schemas'

export interface PlatformAdapter {
  canHandle(url: string): boolean
  captureSubmission(): Submission
  fetchMetadata(): Problem
  isAccepted(result: unknown): boolean
}
