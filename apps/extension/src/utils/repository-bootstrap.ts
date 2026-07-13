import { bootstrapRepository } from '@algoledger/github'
import { getGitHubConfig } from './config-storage'
import { createGitHubClientFromConfig } from './github-client'

export async function runRepositoryBootstrap(): Promise<void> {
  const config = await getGitHubConfig()
  if (!config) {
    throw new Error('GitHub is not configured yet. Set your PAT and repository in Settings first.')
  }

  await bootstrapRepository(createGitHubClientFromConfig(config))
}
