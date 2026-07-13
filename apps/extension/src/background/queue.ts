import { getProblemFolderName } from '@algoledger/generators'
import type { Platform, SyncStatus } from '@algoledger/shared'
import type { AcceptedSubmissionMessage } from '../types/messages'

const QUEUE_STORAGE_KEY = 'algoledger:queue'

/** V1 only captures LeetCode submissions (buildPlan section 5); revisit when a second adapter ships. */
export const CURRENT_PLATFORM: Platform = 'leetcode'

export type RetryPhase = 1 | 2 | 3

export interface QueueItem {
  id: string
  message: AcceptedSubmissionMessage
  status: SyncStatus
  phase: RetryPhase
  attemptsInPhase: number
  enqueuedAt: string
  lastError?: string
}

export function getQueueItemId(message: AcceptedSubmissionMessage): string {
  const folder = getProblemFolderName(message.problem.frontendId, message.problem.slug)
  return `${CURRENT_PLATFORM}/${folder}`
}

async function readQueue(): Promise<QueueItem[]> {
  const stored =
    await chrome.storage.local.get<Record<typeof QUEUE_STORAGE_KEY, QueueItem[]>>(QUEUE_STORAGE_KEY)
  return stored[QUEUE_STORAGE_KEY] ?? []
}

async function writeQueue(queue: QueueItem[]): Promise<void> {
  await chrome.storage.local.set({ [QUEUE_STORAGE_KEY]: queue })
}

export async function enqueueAcceptedSubmission(
  message: AcceptedSubmissionMessage,
): Promise<QueueItem> {
  const id = getQueueItemId(message)
  const queue = await readQueue()
  const existingIndex = queue.findIndex((item) => item.id === id)

  const freshItem: QueueItem = {
    id,
    message,
    status: 'pending',
    phase: 1,
    attemptsInPhase: 0,
    enqueuedAt: new Date().toISOString(),
  }

  if (existingIndex === -1) {
    queue.push(freshItem)
  } else {
    // A new accepted submission for the same problem (resubmit, language change, or a
    // previously-failed sync solved again) restarts retry state fresh rather than resuming
    // whatever phase the old attempt was stuck in.
    queue[existingIndex] = freshItem
  }

  await writeQueue(queue)
  return freshItem
}

export async function getQueueItem(id: string): Promise<QueueItem | null> {
  const queue = await readQueue()
  return queue.find((item) => item.id === id) ?? null
}

export async function updateQueueItem(
  id: string,
  patch: Partial<Omit<QueueItem, 'id' | 'message'>>,
): Promise<void> {
  const queue = await readQueue()
  const index = queue.findIndex((item) => item.id === id)
  const current = queue[index]
  if (index === -1 || !current) return

  queue[index] = { ...current, ...patch }
  await writeQueue(queue)
}

export async function removeQueueItem(id: string): Promise<void> {
  const queue = await readQueue()
  await writeQueue(queue.filter((item) => item.id !== id))
}

export async function getResumableQueueItems(): Promise<QueueItem[]> {
  const queue = await readQueue()
  return queue.filter((item) => item.status === 'pending' || item.status === 'syncing')
}
