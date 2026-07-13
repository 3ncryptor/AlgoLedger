import { EMPTY_STATS, type RepositoryState } from '@algoledger/generators'
import type { GitHubClient } from '@algoledger/github'
import { metadataSchema, type Metadata } from '@algoledger/schemas'
import { safeParseJson, toNameIndex, toProblemIndex } from './safe-json'

const STATS_PATH = '.internal/stats.json'
const TOPIC_INDEX_PATH = '.internal/topic-index.json'
const LANGUAGE_INDEX_PATH = '.internal/language-index.json'
const PLATFORM_INDEX_PATH = '.internal/platform-index.json'
const PROBLEM_INDEX_PATH = '.internal/problem-index.json'

async function fetchExistingMetadata(
  client: GitHubClient,
  folderId: string,
): Promise<Metadata | null> {
  const file = await client.getFile(`${folderId}/metadata.json`)
  if (!file) return null

  const result = metadataSchema.safeParse(safeParseJson(file.content))
  return result.success ? result.data : null
}

export async function fetchRepositoryState(
  client: GitHubClient,
  folderId: string,
): Promise<RepositoryState> {
  const [
    statsFile,
    topicIndexFile,
    languageIndexFile,
    platformIndexFile,
    problemIndexFile,
    existingMetadata,
  ] = await Promise.all([
    client.getFile(STATS_PATH),
    client.getFile(TOPIC_INDEX_PATH),
    client.getFile(LANGUAGE_INDEX_PATH),
    client.getFile(PLATFORM_INDEX_PATH),
    client.getFile(PROBLEM_INDEX_PATH),
    fetchExistingMetadata(client, folderId),
  ])

  const parsedStats = statsFile ? safeParseJson(statsFile.content) : null
  const stats =
    parsedStats && typeof parsedStats === 'object'
      ? { ...EMPTY_STATS, ...parsedStats }
      : EMPTY_STATS

  return {
    existingMetadata,
    stats,
    topicIndex: toNameIndex(topicIndexFile ? safeParseJson(topicIndexFile.content) : null),
    languageIndex: toNameIndex(languageIndexFile ? safeParseJson(languageIndexFile.content) : null),
    platformIndex: toNameIndex(platformIndexFile ? safeParseJson(platformIndexFile.content) : null),
    problemIndex: toProblemIndex(problemIndexFile ? safeParseJson(problemIndexFile.content) : null),
  }
}
