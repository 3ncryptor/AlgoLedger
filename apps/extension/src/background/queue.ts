import type { AcceptedSubmissionMessage } from '../types/messages'

const QUEUE_STORAGE_KEY = 'algoledger:queue'

export async function enqueueAcceptedSubmission(message: AcceptedSubmissionMessage): Promise<void> {
  const stored =
    await chrome.storage.local.get<Record<typeof QUEUE_STORAGE_KEY, AcceptedSubmissionMessage[]>>(
      QUEUE_STORAGE_KEY,
    )
  const queue = stored[QUEUE_STORAGE_KEY] ?? []
  queue.push(message)
  await chrome.storage.local.set({ [QUEUE_STORAGE_KEY]: queue })
}
