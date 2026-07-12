import { z } from 'zod'

const CONFIG_STORAGE_KEY = 'algoledger:config'

const githubConfigSchema = z.object({
  githubPat: z.string(),
  repoOwner: z.string(),
  repoName: z.string(),
  branch: z.string(),
})

export type GitHubConfig = z.infer<typeof githubConfigSchema>

export async function getGitHubConfig(): Promise<GitHubConfig | null> {
  const stored =
    await chrome.storage.local.get<Record<typeof CONFIG_STORAGE_KEY, unknown>>(CONFIG_STORAGE_KEY)
  const raw = stored[CONFIG_STORAGE_KEY]
  if (!raw) return null

  const result = githubConfigSchema.safeParse(raw)
  return result.success ? result.data : null
}

export async function setGitHubConfig(config: GitHubConfig): Promise<void> {
  const validated = githubConfigSchema.parse(config)
  await chrome.storage.local.set({ [CONFIG_STORAGE_KEY]: validated })
}

export async function clearGitHubConfig(): Promise<void> {
  await chrome.storage.local.remove(CONFIG_STORAGE_KEY)
}
