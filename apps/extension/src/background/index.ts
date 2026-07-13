import type { SyncStatus } from '@algoledger/shared'
import { isAcceptedSubmissionMessage } from '../types/messages'
import { enqueueAcceptedSubmission } from './queue'

export const INITIAL_SYNC_STATUS: SyncStatus = 'pending'

chrome.runtime.onMessage.addListener((message: unknown) => {
  if (!isAcceptedSubmissionMessage(message)) return
  void enqueueAcceptedSubmission(message)
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') return
  void chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/index.html') })
})
