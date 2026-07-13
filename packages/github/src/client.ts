import { z } from 'zod'
import { decodeBase64, encodeBase64 } from './base64'
import { GitHubApiError } from './errors'

const GITHUB_API_BASE = 'https://api.github.com'

export interface GitHubClientConfig {
  token: string
  owner: string
  repo: string
  branch: string
}

export interface CommitFile {
  path: string
  content: string
}

export interface RepositoryFile {
  sha: string
  content: string
}

const fileContentSchema = z.object({
  sha: z.string(),
  content: z.string(),
  encoding: z.literal('base64'),
})

const refSchema = z.object({
  object: z.object({ sha: z.string() }),
})

const commitSchema = z.object({
  sha: z.string(),
  tree: z.object({ sha: z.string() }),
})

const blobSchema = z.object({ sha: z.string() })
const treeSchema = z.object({ sha: z.string() })

export interface ViewerInfo {
  login: string
}

export interface RepositoryListItem {
  name: string
  owner: string
  nameWithOwner: string
  defaultBranch: string
  isPrivate: boolean
}

export interface RepositoryListPage {
  repositories: RepositoryListItem[]
  hasNextPage: boolean
  endCursor: string | null
}

const viewerSchema = z.object({
  viewer: z.object({ login: z.string() }),
})

const repositoryListSchema = z.object({
  viewer: z.object({
    repositories: z.object({
      nodes: z.array(
        z.object({
          name: z.string(),
          nameWithOwner: z.string(),
          owner: z.object({ login: z.string() }),
          defaultBranchRef: z.object({ name: z.string() }).nullable(),
          isPrivate: z.boolean(),
        }),
      ),
      pageInfo: z.object({
        hasNextPage: z.boolean(),
        endCursor: z.string().nullable(),
      }),
    }),
  }),
})

const LIST_REPOSITORIES_QUERY = `
  query ListRepositories($after: String) {
    viewer {
      repositories(
        first: 50
        after: $after
        affiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR]
        ownerAffiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR]
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          name
          nameWithOwner
          owner {
            login
          }
          defaultBranchRef {
            name
          }
          isPrivate
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export class GitHubClient {
  constructor(private readonly config: GitHubClientConfig) {}

  private async request(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${GITHUB_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  }

  /**
   * `response.statusText` is frequently empty in practice (HTTP/2, which api.github.com uses,
   * has no textual reason phrase, and Chrome's fetch() often returns "" for it) — relying on it
   * alone produced unhelpful errors like "Failed to get branch ref: ". This always includes the
   * numeric status and, when the body is GitHub's standard `{ message, documentation_url }` JSON
   * error shape, that message too.
   */
  private async throwApiError(action: string, response: Response): Promise<never> {
    let detail: string | null = null
    try {
      const body: unknown = await response.json()
      if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        detail = body.message
      }
    } catch {
      // Body wasn't JSON (or was already consumed) — fall back to status only.
    }

    const suffix = detail ? `: ${detail}` : ''
    throw new GitHubApiError(`${action} (HTTP ${response.status})${suffix}`, response.status)
  }

  async repositoryExists(): Promise<boolean> {
    const response = await this.request(`/repos/${this.config.owner}/${this.config.repo}`)
    if (response.status === 404) return false
    if (!response.ok) {
      await this.throwApiError('Failed to check repository', response)
    }
    return true
  }

  async getFile(path: string): Promise<RepositoryFile | null> {
    const response = await this.request(
      `/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`,
    )
    if (response.status === 404) return null
    if (!response.ok) {
      await this.throwApiError(`Failed to get file "${path}"`, response)
    }

    const data = fileContentSchema.parse(await response.json())
    return { sha: data.sha, content: decodeBase64(data.content) }
  }

  async deleteFile(path: string, message: string): Promise<void> {
    const existing = await this.getFile(path)
    if (!existing) return

    const response = await this.request(
      `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ message, sha: existing.sha, branch: this.config.branch }),
      },
    )
    if (!response.ok) {
      await this.throwApiError(`Failed to delete file "${path}"`, response)
    }
  }

  private async createInitialFile(file: CommitFile, message: string): Promise<void> {
    const { owner, repo, branch } = this.config
    const response = await this.request(`/repos/${owner}/${repo}/contents/${file.path}`, {
      method: 'PUT',
      body: JSON.stringify({ message, content: encodeBase64(file.content), branch }),
    })
    if (!response.ok) {
      await this.throwApiError(`Failed to create initial file "${file.path}"`, response)
    }
  }

  async commitFiles(files: CommitFile[], message: string): Promise<void> {
    if (files.length === 0) return

    const { owner, repo, branch } = this.config

    const refResponse = await this.request(`/repos/${owner}/${repo}/git/ref/heads/${branch}`)

    if (refResponse.status === 404 || refResponse.status === 409) {
      // Truly empty repository: no commits exist yet, so there is no ref for the Git Data API
      // to build on, and GitHub does not allow creating one out of thin air. GitHub returns 409
      // ("Git Repository is empty.") for a brand-new repo with zero commits, or 404 if the
      // specific branch just doesn't exist yet on an otherwise non-empty repo — both need the
      // same fix. GitHub's own guide says to establish the first commit (and the branch) via
      // the Contents API instead, then continue with any remaining files as a normal Git Data
      // API commit.
      const firstFile = files[0]!
      const restFiles = files.slice(1)
      await this.createInitialFile(firstFile, message)
      if (restFiles.length > 0) {
        await this.commitFiles(restFiles, message)
      }
      return
    }

    if (!refResponse.ok) {
      await this.throwApiError('Failed to get branch ref', refResponse)
    }
    const ref = refSchema.parse(await refResponse.json())
    const baseCommitSha = ref.object.sha

    const commitResponse = await this.request(
      `/repos/${owner}/${repo}/git/commits/${baseCommitSha}`,
    )
    if (!commitResponse.ok) {
      await this.throwApiError('Failed to get base commit', commitResponse)
    }
    const baseCommit = commitSchema.parse(await commitResponse.json())

    const blobs = await Promise.all(
      files.map(async (file) => {
        const blobResponse = await this.request(`/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: encodeBase64(file.content), encoding: 'base64' }),
        })
        if (!blobResponse.ok) {
          await this.throwApiError(`Failed to create blob for "${file.path}"`, blobResponse)
        }
        const blob = blobSchema.parse(await blobResponse.json())
        return { path: file.path, sha: blob.sha }
      }),
    )

    const treeResponse = await this.request(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseCommit.tree.sha,
        tree: blobs.map((blob) => ({
          path: blob.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        })),
      }),
    })
    if (!treeResponse.ok) {
      await this.throwApiError('Failed to create tree', treeResponse)
    }
    const tree = treeSchema.parse(await treeResponse.json())

    const newCommitResponse = await this.request(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message, tree: tree.sha, parents: [baseCommitSha] }),
    })
    if (!newCommitResponse.ok) {
      await this.throwApiError('Failed to create commit', newCommitResponse)
    }
    const newCommit = commitSchema.parse(await newCommitResponse.json())

    const updateRefResponse = await this.request(
      `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ sha: newCommit.sha }),
      },
    )
    if (!updateRefResponse.ok) {
      await this.throwApiError('Failed to update branch ref', updateRefResponse)
    }
  }

  async graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await this.request('/graphql', {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    })
    if (!response.ok) {
      await this.throwApiError('GraphQL request failed', response)
    }

    const result = (await response.json()) as { data?: T; errors?: Array<{ message: string }> }
    if (result.errors && result.errors.length > 0) {
      throw new GitHubApiError(
        result.errors.map((error) => error.message).join('; '),
        response.status,
      )
    }
    if (!result.data) {
      throw new GitHubApiError('GraphQL response missing data', response.status)
    }
    return result.data
  }

  async getViewer(): Promise<ViewerInfo> {
    const data = await this.graphqlRequest<unknown>('query { viewer { login } }')
    return viewerSchema.parse(data).viewer
  }

  async listRepositories(after: string | null = null): Promise<RepositoryListPage> {
    const data = await this.graphqlRequest<unknown>(LIST_REPOSITORIES_QUERY, { after })
    const { nodes, pageInfo } = repositoryListSchema.parse(data).viewer.repositories

    return {
      repositories: nodes.map((node) => ({
        name: node.name,
        owner: node.owner.login,
        nameWithOwner: node.nameWithOwner,
        defaultBranch: node.defaultBranchRef?.name ?? 'main',
        isPrivate: node.isPrivate,
      })),
      hasNextPage: pageInfo.hasNextPage,
      endCursor: pageInfo.endCursor,
    }
  }
}
