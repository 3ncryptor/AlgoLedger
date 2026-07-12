import { GitHubClient, bootstrapRepository } from '@algoledger/github'
import { getGitHubConfig } from './config-storage'

export async function runRepositoryBootstrap(): Promise<void> {
  const config = await getGitHubConfig()
  if (!config) {
    throw new Error('GitHub is not configured yet. Set your PAT and repository in Settings first.')
  }

  const client = new GitHubClient({
    token: config.githubPat,
    owner: config.repoOwner,
    repo: config.repoName,
    branch: config.branch,
  })

  await bootstrapRepository(client)
}
