import { beforeEach, describe, expect, test, vi } from 'vitest'
import { GitHubClient } from '../src/client'
import { GitHubApiError } from '../src/errors'
import { encodeBase64 } from '../src/base64'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    json: async () => body,
  } as Response
}

describe('GitHubClient', () => {
  const config = { token: 'test-token', owner: 'algoledger', repo: 'algoledger', branch: 'main' }
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  describe('repositoryExists', () => {
    test('returns true for a 200 response', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))
      const client = new GitHubClient(config)

      await expect(client.repositoryExists()).resolves.toBe(true)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/repos/algoledger/algoledger',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      )
    })

    test('returns false for a 404 response', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(404, {}))
      const client = new GitHubClient(config)

      await expect(client.repositoryExists()).resolves.toBe(false)
    })

    test('throws GitHubApiError for other non-2xx statuses', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(500, {}))
      const client = new GitHubClient(config)

      await expect(client.repositoryExists()).rejects.toThrow(GitHubApiError)
    })
  })

  describe('getFile', () => {
    test('decodes base64 content and returns sha on 200', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, { sha: 'abc123', content: encodeBase64('hello'), encoding: 'base64' }),
      )
      const client = new GitHubClient(config)

      await expect(client.getFile('README.md')).resolves.toEqual({
        sha: 'abc123',
        content: 'hello',
      })
    })

    test('returns null on 404 (file does not exist)', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(404, {}))
      const client = new GitHubClient(config)

      await expect(client.getFile('missing.md')).resolves.toBeNull()
    })
  })

  describe('deleteFile', () => {
    test('does nothing when the file does not exist', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(404, {}))
      const client = new GitHubClient(config)

      await client.deleteFile('missing.md', 'chore: remove')

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    test('fetches the sha then issues a DELETE carrying it', async () => {
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse(200, { sha: 'file-sha', content: encodeBase64('x'), encoding: 'base64' }),
        )
        .mockResolvedValueOnce(jsonResponse(200, {}))
      const client = new GitHubClient(config)

      await client.deleteFile('old.md', 'chore: remove old.md')

      expect(fetchMock).toHaveBeenCalledTimes(2)
      const [, deleteCallInit] = fetchMock.mock.calls[1] as [string, RequestInit]
      expect(deleteCallInit.method).toBe('DELETE')
      expect(JSON.parse(deleteCallInit.body as string)).toEqual({
        message: 'chore: remove old.md',
        sha: 'file-sha',
        branch: 'main',
      })
    })
  })

  describe('commitFiles', () => {
    test('does nothing for an empty file list', async () => {
      const client = new GitHubClient(config)

      await client.commitFiles([], 'no-op')

      expect(fetchMock).not.toHaveBeenCalled()
    })

    test('walks ref -> base commit -> blobs -> tree -> commit -> update ref for a single-commit multi-file write', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(200, { object: { sha: 'base-commit-sha' } }))
        .mockResolvedValueOnce(
          jsonResponse(200, { sha: 'base-commit-sha', tree: { sha: 'base-tree-sha' } }),
        )
        .mockResolvedValueOnce(jsonResponse(201, { sha: 'blob-sha-1' }))
        .mockResolvedValueOnce(jsonResponse(201, { sha: 'blob-sha-2' }))
        .mockResolvedValueOnce(jsonResponse(201, { sha: 'new-tree-sha' }))
        .mockResolvedValueOnce(
          jsonResponse(201, { sha: 'new-commit-sha', tree: { sha: 'new-tree-sha' } }),
        )
        .mockResolvedValueOnce(jsonResponse(200, {}))

      const client = new GitHubClient(config)

      await client.commitFiles(
        [
          { path: 'leetcode/0001-two-sum/README.md', content: '# Two Sum' },
          { path: 'leetcode/0001-two-sum/metadata.json', content: '{}' },
        ],
        'feat(leetcode): solve 0001-two-sum',
      )

      expect(fetchMock).toHaveBeenCalledTimes(7)

      const [refUrl] = fetchMock.mock.calls[0] as [string]
      expect(refUrl).toBe('https://api.github.com/repos/algoledger/algoledger/git/ref/heads/main')

      const [, treeInit] = fetchMock.mock.calls[4] as [string, RequestInit]
      const treeBody = JSON.parse(treeInit.body as string)
      expect(treeBody.base_tree).toBe('base-tree-sha')
      expect(treeBody.tree).toEqual([
        {
          path: 'leetcode/0001-two-sum/README.md',
          mode: '100644',
          type: 'blob',
          sha: 'blob-sha-1',
        },
        {
          path: 'leetcode/0001-two-sum/metadata.json',
          mode: '100644',
          type: 'blob',
          sha: 'blob-sha-2',
        },
      ])

      const [, commitInit] = fetchMock.mock.calls[5] as [string, RequestInit]
      const commitBody = JSON.parse(commitInit.body as string)
      expect(commitBody).toEqual({
        message: 'feat(leetcode): solve 0001-two-sum',
        tree: 'new-tree-sha',
        parents: ['base-commit-sha'],
      })

      const [refUpdateUrl, refUpdateInit] = fetchMock.mock.calls[6] as [string, RequestInit]
      expect(refUpdateUrl).toBe(
        'https://api.github.com/repos/algoledger/algoledger/git/refs/heads/main',
      )
      expect(refUpdateInit.method).toBe('PATCH')
      expect(JSON.parse(refUpdateInit.body as string)).toEqual({ sha: 'new-commit-sha' })
    })

    test('throws GitHubApiError if the branch ref cannot be fetched', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(404, {}))
      const client = new GitHubClient(config)

      await expect(client.commitFiles([{ path: 'a.md', content: 'x' }], 'msg')).rejects.toThrow(
        GitHubApiError,
      )
    })
  })

  describe('graphqlRequest', () => {
    test('returns data on success', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { viewer: { login: 'octocat' } } }))
      const client = new GitHubClient(config)

      const result = await client.graphqlRequest<{ viewer: { login: string } }>(
        'query { viewer { login } }',
      )

      expect(result).toEqual({ viewer: { login: 'octocat' } })
    })

    test('throws GitHubApiError when the response contains graphql errors', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, { errors: [{ message: 'Bad credentials' }] }),
      )
      const client = new GitHubClient(config)

      await expect(client.graphqlRequest('query { viewer { login } }')).rejects.toThrow(
        GitHubApiError,
      )
    })
  })

  describe('getViewer', () => {
    test('returns the authenticated login on success', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { viewer: { login: 'octocat' } } }))
      const client = new GitHubClient(config)

      await expect(client.getViewer()).resolves.toEqual({ login: 'octocat' })
    })

    test('throws if the response does not match the expected shape', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { viewer: {} } }))
      const client = new GitHubClient(config)

      await expect(client.getViewer()).rejects.toThrow()
    })
  })

  describe('listRepositories', () => {
    test('maps GraphQL nodes into RepositoryListItem entries', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            viewer: {
              repositories: {
                nodes: [
                  {
                    name: 'algoledger',
                    nameWithOwner: 'aryanvibhuti/algoledger',
                    owner: { login: 'aryanvibhuti' },
                    defaultBranchRef: { name: 'main' },
                    isPrivate: false,
                  },
                ],
                pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              },
            },
          },
        }),
      )
      const client = new GitHubClient(config)

      await expect(client.listRepositories()).resolves.toEqual({
        repositories: [
          {
            name: 'algoledger',
            owner: 'aryanvibhuti',
            nameWithOwner: 'aryanvibhuti/algoledger',
            defaultBranch: 'main',
            isPrivate: false,
          },
        ],
        hasNextPage: true,
        endCursor: 'cursor-1',
      })
    })

    test('falls back to "main" when defaultBranchRef is null (empty repository)', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            viewer: {
              repositories: {
                nodes: [
                  {
                    name: 'empty-repo',
                    nameWithOwner: 'aryanvibhuti/empty-repo',
                    owner: { login: 'aryanvibhuti' },
                    defaultBranchRef: null,
                    isPrivate: true,
                  },
                ],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          },
        }),
      )
      const client = new GitHubClient(config)

      const result = await client.listRepositories()

      expect(result.repositories[0]?.defaultBranch).toBe('main')
    })

    test('passes the cursor through as the "after" GraphQL variable', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            viewer: {
              repositories: {
                nodes: [],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          },
        }),
      )
      const client = new GitHubClient(config)

      await client.listRepositories('cursor-1')

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(JSON.parse(init.body as string).variables).toEqual({ after: 'cursor-1' })
    })
  })
})
