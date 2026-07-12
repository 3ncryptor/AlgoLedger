import { beforeEach, describe, expect, test, vi } from 'vitest'
import { GitHubClient } from '../src/client'
import { bootstrapRepository } from '../src/bootstrap'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    json: async () => body,
  } as Response
}

const EXISTING_FILE = { sha: 'sha', content: 'e30=', encoding: 'base64' }

describe('bootstrapRepository', () => {
  const config = { token: 't', owner: 'algoledger', repo: 'algoledger', branch: 'main' }
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  test('throws if the repository does not exist, rather than creating one', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(404, {}))
    const client = new GitHubClient(config)

    await expect(bootstrapRepository(client)).rejects.toThrow(/does not exist/i)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('does nothing when every base file already exists', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))
    for (let i = 0; i < 7; i++) {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, EXISTING_FILE))
    }
    const client = new GitHubClient(config)

    await bootstrapRepository(client)

    expect(fetchMock).toHaveBeenCalledTimes(8)
    expect(fetchMock.mock.calls.some(([url]) => (url as string).includes('/git/'))).toBe(false)
  })

  test('commits only the missing base files in a single commit', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, {})) // repositoryExists
      .mockResolvedValueOnce(jsonResponse(404, {})) // README.md missing
      .mockResolvedValueOnce(jsonResponse(200, EXISTING_FILE)) // leetcode/README.md exists
      .mockResolvedValueOnce(jsonResponse(404, {})) // stats.json missing
      .mockResolvedValueOnce(jsonResponse(200, EXISTING_FILE)) // topic-index.json exists
      .mockResolvedValueOnce(jsonResponse(200, EXISTING_FILE)) // language-index.json exists
      .mockResolvedValueOnce(jsonResponse(200, EXISTING_FILE)) // platform-index.json exists
      .mockResolvedValueOnce(jsonResponse(200, EXISTING_FILE)) // cache.json exists
      .mockResolvedValueOnce(jsonResponse(200, { object: { sha: 'base-commit' } })) // ref
      .mockResolvedValueOnce(jsonResponse(200, { sha: 'base-commit', tree: { sha: 'base-tree' } })) // base commit
      .mockResolvedValueOnce(jsonResponse(201, { sha: 'blob-1' })) // blob for README.md
      .mockResolvedValueOnce(jsonResponse(201, { sha: 'blob-2' })) // blob for stats.json
      .mockResolvedValueOnce(jsonResponse(201, { sha: 'new-tree' })) // tree
      .mockResolvedValueOnce(jsonResponse(201, { sha: 'new-commit', tree: { sha: 'new-tree' } })) // commit
      .mockResolvedValueOnce(jsonResponse(200, {})) // update ref

    const client = new GitHubClient(config)

    await bootstrapRepository(client)

    expect(fetchMock).toHaveBeenCalledTimes(15)

    const treeCall = fetchMock.mock.calls.find(([url]) => (url as string).endsWith('/git/trees'))
    expect(treeCall).toBeDefined()
    const [, treeInit] = treeCall as [string, RequestInit]
    const treeBody = JSON.parse(treeInit.body as string) as { tree: Array<{ path: string }> }
    expect(treeBody.tree.map((entry) => entry.path)).toEqual(['README.md', '.internal/stats.json'])

    const commitCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        (url as string).endsWith('/git/commits') && (init as RequestInit)?.method === 'POST',
    )
    const [, commitInit] = commitCall as [string, RequestInit]
    expect(JSON.parse(commitInit.body as string).message).toBe(
      'chore: bootstrap repository structure',
    )
  })
})
