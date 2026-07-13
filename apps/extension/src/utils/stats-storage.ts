import { EMPTY_NAME_INDEX, EMPTY_STATS, type NameIndex, type Stats } from '@algoledger/generators'
import type { GitHubClient } from '@algoledger/github'

const STATS_PATH = '.internal/stats.json'
const TOPIC_INDEX_PATH = '.internal/topic-index.json'
const PLATFORM_INDEX_PATH = '.internal/platform-index.json'

function safeParseJson(content: string): unknown {
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

function toNameIndex(parsed: unknown): NameIndex {
  return parsed && typeof parsed === 'object'
    ? { ...EMPTY_NAME_INDEX, ...parsed }
    : EMPTY_NAME_INDEX
}

export interface RemoteStats {
  stats: Stats
  topicIndex: NameIndex
  platformIndex: NameIndex
}

export async function fetchRemoteStats(client: GitHubClient): Promise<RemoteStats> {
  const [statsFile, topicIndexFile, platformIndexFile] = await Promise.all([
    client.getFile(STATS_PATH),
    client.getFile(TOPIC_INDEX_PATH),
    client.getFile(PLATFORM_INDEX_PATH),
  ])

  const parsedStats = statsFile ? safeParseJson(statsFile.content) : null

  const stats: Stats =
    parsedStats && typeof parsedStats === 'object'
      ? { ...EMPTY_STATS, ...parsedStats }
      : EMPTY_STATS

  const topicIndex = toNameIndex(topicIndexFile ? safeParseJson(topicIndexFile.content) : null)
  const platformIndex = toNameIndex(
    platformIndexFile ? safeParseJson(platformIndexFile.content) : null,
  )

  return { stats, topicIndex, platformIndex }
}
