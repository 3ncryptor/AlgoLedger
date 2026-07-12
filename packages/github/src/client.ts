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

  async repositoryExists(): Promise<boolean> {
    const response = await this.request(`/repos/${this.config.owner}/${this.config.repo}`)
    if (response.status === 404) return false
    if (!response.ok) {
      throw new GitHubApiError(
        `Failed to check repository: ${response.statusText}`,
        response.status,
      )
    }
    return true
  }

  async getFile(path: string): Promise<RepositoryFile | null> {
    const response = await this.request(
      `/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`,
    )
    if (response.status === 404) return null
    if (!response.ok) {
      throw new GitHubApiError(
        `Failed to get file "${path}": ${response.statusText}`,
        response.status,
      )
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
      throw new GitHubApiError(
        `Failed to delete file "${path}": ${response.statusText}`,
        response.status,
      )
    }
  }

  async commitFiles(files: CommitFile[], message: string): Promise<void> {
    if (files.length === 0) return

    const { owner, repo, branch } = this.config

    const refResponse = await this.request(`/repos/${owner}/${repo}/git/ref/heads/${branch}`)
    if (!refResponse.ok) {
      throw new GitHubApiError(
        `Failed to get branch ref: ${refResponse.statusText}`,
        refResponse.status,
      )
    }
    const ref = refSchema.parse(await refResponse.json())
    const baseCommitSha = ref.object.sha

    const commitResponse = await this.request(
      `/repos/${owner}/${repo}/git/commits/${baseCommitSha}`,
    )
    if (!commitResponse.ok) {
      throw new GitHubApiError(
        `Failed to get base commit: ${commitResponse.statusText}`,
        commitResponse.status,
      )
    }
    const baseCommit = commitSchema.parse(await commitResponse.json())

    const blobs = await Promise.all(
      files.map(async (file) => {
        const blobResponse = await this.request(`/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: encodeBase64(file.content), encoding: 'base64' }),
        })
        if (!blobResponse.ok) {
          throw new GitHubApiError(
            `Failed to create blob for "${file.path}": ${blobResponse.statusText}`,
            blobResponse.status,
          )
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
      throw new GitHubApiError(
        `Failed to create tree: ${treeResponse.statusText}`,
        treeResponse.status,
      )
    }
    const tree = treeSchema.parse(await treeResponse.json())

    const newCommitResponse = await this.request(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message, tree: tree.sha, parents: [baseCommitSha] }),
    })
    if (!newCommitResponse.ok) {
      throw new GitHubApiError(
        `Failed to create commit: ${newCommitResponse.statusText}`,
        newCommitResponse.status,
      )
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
      throw new GitHubApiError(
        `Failed to update branch ref: ${updateRefResponse.statusText}`,
        updateRefResponse.status,
      )
    }
  }

  async graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await this.request('/graphql', {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    })
    if (!response.ok) {
      throw new GitHubApiError(`GraphQL request failed: ${response.statusText}`, response.status)
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
}
