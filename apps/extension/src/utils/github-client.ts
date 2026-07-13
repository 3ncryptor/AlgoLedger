import { GitHubClient } from '@algoledger/github'
import type { GitHubConfig } from './config-storage'

export function createGitHubClientFromConfig(config: GitHubConfig): GitHubClient {
  return new GitHubClient({
    token: config.githubPat,
    owner: config.repoOwner,
    repo: config.repoName,
    branch: config.branch,
  })
}
