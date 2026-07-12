import { beforeEach, describe, expect, test, vi } from 'vitest'
import { runRepositoryBootstrap } from '../../src/background/bootstrap'
import { setGitHubConfig } from '../../src/background/config-storage'

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

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    json: async () => body,
  } as Response
}

describe('runRepositoryBootstrap', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubGlobal('chrome', createChromeStorageMock())
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  test('throws a clear error when GitHub has not been configured yet', async () => {
    await expect(runRepositoryBootstrap()).rejects.toThrow(/not configured/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('builds a GitHubClient from stored config and bootstraps the repository', async () => {
    await setGitHubConfig({
      githubPat: 'ghp_test',
      repoOwner: 'aryanvibhuti',
      repoName: 'algoledger',
      branch: 'main',
    })

    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))
    for (let i = 0; i < 7; i++) {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, { sha: `sha-${i}`, content: 'e30=', encoding: 'base64' }),
      )
    }

    await runRepositoryBootstrap()

    const [firstUrl, firstInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(firstUrl).toBe('https://api.github.com/repos/aryanvibhuti/algoledger')
    expect((firstInit.headers as Record<string, string>).Authorization).toBe('Bearer ghp_test')
  })
})
