import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  enqueueAcceptedSubmission,
  getQueueItem,
  getQueueItemId,
  getResumableQueueItems,
  removeQueueItem,
  updateQueueItem,
} from '../../src/background/queue'
import { acceptedSubmissionMessage } from '../fixtures'

function createChromeStorageMock() {
  const store = new Map<string, unknown>()
  return {
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: store.get(key) })),
        set: vi.fn(async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) store.set(key, value)
        }),
      },
    },
  }
}

describe('queue', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', createChromeStorageMock())
  })

  test('getQueueItemId derives a stable id from platform and folder name', () => {
    expect(getQueueItemId(acceptedSubmissionMessage)).toBe('leetcode/0001-two-sum')
  })

  test('enqueueAcceptedSubmission adds a fresh pending item at phase 1', async () => {
    const item = await enqueueAcceptedSubmission(acceptedSubmissionMessage)

    expect(item.id).toBe('leetcode/0001-two-sum')
    expect(item.status).toBe('pending')
    expect(item.phase).toBe(1)
    expect(item.attemptsInPhase).toBe(0)

    await expect(getQueueItem(item.id)).resolves.toEqual(item)
  })

  test('enqueueing the same problem again resets retry state instead of duplicating', async () => {
    const first = await enqueueAcceptedSubmission(acceptedSubmissionMessage)
    await updateQueueItem(first.id, { status: 'failed', phase: 3, attemptsInPhase: 10 })

    const second = await enqueueAcceptedSubmission(acceptedSubmissionMessage)

    expect(second.status).toBe('pending')
    expect(second.phase).toBe(1)
    expect(second.attemptsInPhase).toBe(0)

    const resumable = await getResumableQueueItems()
    expect(resumable).toHaveLength(1)
  })

  test('updateQueueItem merges a partial patch onto the existing item', async () => {
    const item = await enqueueAcceptedSubmission(acceptedSubmissionMessage)

    await updateQueueItem(item.id, { status: 'retrying', phase: 2, attemptsInPhase: 3 })

    const updated = await getQueueItem(item.id)
    expect(updated?.status).toBe('retrying')
    expect(updated?.phase).toBe(2)
    expect(updated?.attemptsInPhase).toBe(3)
    expect(updated?.message).toEqual(acceptedSubmissionMessage)
  })

  test('removeQueueItem deletes the item entirely', async () => {
    const item = await enqueueAcceptedSubmission(acceptedSubmissionMessage)

    await removeQueueItem(item.id)

    await expect(getQueueItem(item.id)).resolves.toBeNull()
  })

  test('getResumableQueueItems only returns pending or syncing items', async () => {
    const item = await enqueueAcceptedSubmission(acceptedSubmissionMessage)
    await updateQueueItem(item.id, { status: 'synced' })

    const resumable = await getResumableQueueItems()
    expect(resumable).toHaveLength(0)
  })

  test('getQueueItem returns null for an unknown id', async () => {
    await expect(getQueueItem('leetcode/does-not-exist')).resolves.toBeNull()
  })
})
