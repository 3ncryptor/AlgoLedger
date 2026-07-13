import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  clearSyncProgress,
  getSyncProgress,
  setSyncProgress,
  type SyncProgressState,
} from '../../src/utils/sync-progress'

function createChromeStorageMock() {
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
  }
}

const sample: SyncProgressState = {
  itemId: 'leetcode/0001-two-sum',
  problemTitle: 'Two Sum',
  platform: 'leetcode',
  language: 'python3',
  stage: 'Committing to GitHub...',
  progress: 75,
}

describe('sync-progress', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', createChromeStorageMock())
  })

  test('returns null when nothing is in progress', async () => {
    await expect(getSyncProgress()).resolves.toBeNull()
  })

  test('round-trips a progress state through set/get', async () => {
    await setSyncProgress(sample)

    await expect(getSyncProgress()).resolves.toEqual(sample)
  })

  test('clearSyncProgress removes the state when the item id matches', async () => {
    await setSyncProgress(sample)

    await clearSyncProgress(sample.itemId)

    await expect(getSyncProgress()).resolves.toBeNull()
  })

  test('clearSyncProgress is a no-op when the item id does not match the current state', async () => {
    await setSyncProgress(sample)

    await clearSyncProgress('leetcode/0146-lru-cache')

    await expect(getSyncProgress()).resolves.toEqual(sample)
  })
})
