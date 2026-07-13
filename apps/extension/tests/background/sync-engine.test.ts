import { beforeEach, describe, expect, test, vi } from 'vitest'
import { EMPTY_REPOSITORY_STATE } from '@algoledger/generators'

const mocks = vi.hoisted(() => ({
  commitFiles: vi.fn(),
  deleteFile: vi.fn(),
  fetchRepositoryState: vi.fn(),
  notifySuccess: vi.fn(),
  notifyRetry: vi.fn(),
  notifyFailure: vi.fn(),
}))

vi.mock('../../src/utils/github-client', () => ({
  createGitHubClientFromConfig: vi.fn(() => ({
    commitFiles: mocks.commitFiles,
    deleteFile: mocks.deleteFile,
  })),
}))

vi.mock('../../src/utils/repository-state', () => ({
  fetchRepositoryState: mocks.fetchRepositoryState,
}))

vi.mock('../../src/notifications', () => ({
  notifySuccess: mocks.notifySuccess,
  notifyRetry: mocks.notifyRetry,
  notifyFailure: mocks.notifyFailure,
}))

import {
  enqueueAndSync,
  resumePendingQueueItems,
  retryAlarmName,
  retryQueueItemNow,
} from '../../src/background/sync-engine'
import { enqueueAcceptedSubmission, getQueueItem } from '../../src/background/queue'
import { getGitHubConfig, setGitHubConfig } from '../../src/utils/config-storage'
import { acceptedSubmissionMessage } from '../fixtures'

const ITEM_ID = 'leetcode/0001-two-sum'

function createChromeMock() {
  const store = new Map<string, unknown>()
  return {
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: store.get(key) })),
        set: vi.fn(async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) store.set(key, value)
        }),
        remove: vi.fn(async (key: string) => {
          store.delete(key)
        }),
      },
    },
    alarms: { create: vi.fn() },
  }
}

/** Drives a permanently-failing item through all 25 attempts (phase 1 immediate + phase 2/3 alarms). */
async function exhaustAllRetries(): Promise<void> {
  vi.useFakeTimers()
  const done = enqueueAndSync(acceptedSubmissionMessage)
  await vi.runAllTimersAsync()
  await done
  vi.useRealTimers()

  for (let i = 0; i < 10; i++) await retryQueueItemNow(ITEM_ID) // phase 2's 10 attempts
  for (let i = 0; i < 10; i++) await retryQueueItemNow(ITEM_ID) // phase 3's 10 attempts, last one fails
}

describe('sync-engine', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.stubGlobal('chrome', createChromeMock())
    mocks.fetchRepositoryState.mockResolvedValue(EMPTY_REPOSITORY_STATE)
    await setGitHubConfig({
      githubPat: 'ghp_test',
      repoOwner: 'aryanvibhuti',
      repoName: 'algoledger',
      branch: 'main',
    })
  })

  test('a successful commit removes the queue item and notifies success', async () => {
    mocks.commitFiles.mockResolvedValueOnce(undefined)

    await enqueueAndSync(acceptedSubmissionMessage)

    expect(mocks.commitFiles).toHaveBeenCalledTimes(1)
    expect(mocks.notifySuccess).toHaveBeenCalledWith(acceptedSubmissionMessage.problem, ITEM_ID)
    await expect(getQueueItem(ITEM_ID)).resolves.toBeNull()
  })

  test('clears sync progress after a successful commit', async () => {
    mocks.commitFiles.mockResolvedValueOnce(undefined)

    await enqueueAndSync(acceptedSubmissionMessage)

    const { getSyncProgress } = await import('../../src/utils/sync-progress')
    await expect(getSyncProgress()).resolves.toBeNull()
  })

  test('clears sync progress after a failed attempt too', async () => {
    mocks.commitFiles.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(undefined)

    vi.useFakeTimers()
    const done = enqueueAndSync(acceptedSubmissionMessage)
    await vi.runAllTimersAsync()
    await done
    vi.useRealTimers()

    const { getSyncProgress } = await import('../../src/utils/sync-progress')
    await expect(getSyncProgress()).resolves.toBeNull()
  })

  test('does nothing and leaves the item pending when GitHub is not configured yet', async () => {
    vi.stubGlobal('chrome', createChromeMock())
    await expect(getGitHubConfig()).resolves.toBeNull()

    await enqueueAndSync(acceptedSubmissionMessage)

    expect(mocks.commitFiles).not.toHaveBeenCalled()
    const item = await getQueueItem(ITEM_ID)
    expect(item?.status).toBe('pending')
  })

  test('retries immediately up to 5 times before escalating to a phase-2 alarm', async () => {
    mocks.commitFiles.mockRejectedValue(new Error('network error'))

    vi.useFakeTimers()
    const done = enqueueAndSync(acceptedSubmissionMessage)
    await vi.runAllTimersAsync()
    await done
    vi.useRealTimers()

    expect(mocks.commitFiles).toHaveBeenCalledTimes(5)
    const item = await getQueueItem(ITEM_ID)
    expect(item?.status).toBe('retrying')
    expect(item?.phase).toBe(2)
    expect(item?.attemptsInPhase).toBe(0)
    expect(chrome.alarms.create).toHaveBeenCalledWith(retryAlarmName(ITEM_ID), {
      delayInMinutes: 30,
    })
    expect(mocks.notifyRetry).toHaveBeenCalledTimes(1)
  })

  test('fails permanently and notifies failure after phase 3 is exhausted', async () => {
    mocks.commitFiles.mockRejectedValue(new Error('still down'))

    await exhaustAllRetries()

    const item = await getQueueItem(ITEM_ID)
    expect(item?.status).toBe('failed')
    expect(mocks.notifyFailure).toHaveBeenCalledWith(acceptedSubmissionMessage.problem, ITEM_ID)
  })

  test('retryQueueItemNow resets a failed item to phase 1 and tries again', async () => {
    mocks.commitFiles.mockRejectedValue(new Error('down'))
    await exhaustAllRetries()

    const failedItem = await getQueueItem(ITEM_ID)
    expect(failedItem?.status).toBe('failed')

    mocks.commitFiles.mockResolvedValueOnce(undefined)
    await retryQueueItemNow(ITEM_ID)

    await expect(getQueueItem(ITEM_ID)).resolves.toBeNull()
    expect(mocks.notifySuccess).toHaveBeenCalled()
  })

  test('resumePendingQueueItems retries anything left pending or syncing', async () => {
    // Seed a queue item directly (not via enqueueAndSync) to simulate a submission that was
    // captured but never got a chance to attempt sync — e.g. the service worker was killed
    // immediately after enqueueing.
    await enqueueAcceptedSubmission(acceptedSubmissionMessage)
    mocks.commitFiles.mockResolvedValueOnce(undefined)

    await resumePendingQueueItems()

    await expect(getQueueItem(ITEM_ID)).resolves.toBeNull()
    expect(mocks.notifySuccess).toHaveBeenCalled()
  })
})
