import type { SyncStatus } from '@algoledger/shared'
import { isAcceptedSubmissionMessage } from '../types/messages'
import { enqueueAcceptedSubmission } from './queue'

export const INITIAL_SYNC_STATUS: SyncStatus = 'pending'

chrome.runtime.onMessage.addListener((message: unknown) => {
  if (!isAcceptedSubmissionMessage(message)) return
  void enqueueAcceptedSubmission(message)
})
