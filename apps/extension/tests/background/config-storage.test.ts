import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  clearGitHubConfig,
  getGitHubConfig,
  setGitHubConfig,
} from '../../src/background/config-storage'

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

describe('GitHub config storage', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', createChromeStorageMock())
  })

  test('returns null when nothing has been stored yet', async () => {
    await expect(getGitHubConfig()).resolves.toBeNull()
  })

  test('round-trips a valid config through set/get', async () => {
    const config = {
      githubPat: 'ghp_test',
      repoOwner: 'aryanvibhuti',
      repoName: 'algoledger',
      branch: 'main',
    }

    await setGitHubConfig(config)

    await expect(getGitHubConfig()).resolves.toEqual(config)
  })

  test('returns null if the stored value does not match the expected shape', async () => {
    const chromeMock = (
      globalThis as unknown as { chrome: ReturnType<typeof createChromeStorageMock> }
    ).chrome
    await chromeMock.storage.local.set({ 'algoledger:config': { unexpected: true } })

    await expect(getGitHubConfig()).resolves.toBeNull()
  })

  test('clearGitHubConfig removes the stored config', async () => {
    const config = {
      githubPat: 'ghp_test',
      repoOwner: 'aryanvibhuti',
      repoName: 'algoledger',
      branch: 'main',
    }
    await setGitHubConfig(config)

    await clearGitHubConfig()

    await expect(getGitHubConfig()).resolves.toBeNull()
  })

  test('setGitHubConfig throws for an invalid config, failing fast rather than silently storing garbage', async () => {
    await expect(
      // @ts-expect-error - intentionally invalid input for the test
      setGitHubConfig({ githubPat: 'ghp_test' }),
    ).rejects.toThrow()
  })
})
