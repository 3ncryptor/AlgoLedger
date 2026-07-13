import type { Metadata, Problem, Submission } from '@algoledger/schemas'
import type { Platform } from '@algoledger/shared'
import { getProblemFolderName } from './folder-name'
import { generateLeetcodeIndexReadme } from './generate-leetcode-index-readme'
import { generateMetadata } from './generate-metadata'
import { generateReadme } from './generate-readme'
import { generateSolutionFile, type GeneratedFile } from './generate-solution-file'
import { getLanguageInfo } from './language-info'
import { EMPTY_STATS, updateStats, type Stats } from './stats/stats'
import {
  addManyToIndex,
  addToIndex,
  removeFromIndex,
  EMPTY_NAME_INDEX,
  type NameIndex,
} from './stats/name-index'
import {
  upsertProblemIndexEntry,
  EMPTY_PROBLEM_INDEX,
  type ProblemIndex,
} from './stats/problem-index'

export interface RepositoryState {
  existingMetadata: Metadata | null
  stats: Stats
  topicIndex: NameIndex
  languageIndex: NameIndex
  platformIndex: NameIndex
  problemIndex: ProblemIndex
}

export const EMPTY_REPOSITORY_STATE: RepositoryState = {
  existingMetadata: null,
  stats: EMPTY_STATS,
  topicIndex: EMPTY_NAME_INDEX,
  languageIndex: EMPTY_NAME_INDEX,
  platformIndex: EMPTY_NAME_INDEX,
  problemIndex: EMPTY_PROBLEM_INDEX,
}

export interface AcceptedSubmissionPlan {
  commitFiles: GeneratedFile[]
  deletePaths: string[]
  commitMessage: string
}

const INTERNAL_STATS_PATH = '.internal/stats.json'
const INTERNAL_TOPIC_INDEX_PATH = '.internal/topic-index.json'
const INTERNAL_LANGUAGE_INDEX_PATH = '.internal/language-index.json'
const INTERNAL_PLATFORM_INDEX_PATH = '.internal/platform-index.json'
const INTERNAL_PROBLEM_INDEX_PATH = '.internal/problem-index.json'
const LEETCODE_README_PATH = 'leetcode/README.md'
const LEETCODE_PLATFORM: Platform = 'leetcode'

function toJsonFile(path: string, value: unknown): GeneratedFile {
  return { path, content: `${JSON.stringify(value, null, 2)}\n` }
}

export function planAcceptedSubmission(
  platform: Platform,
  problem: Problem,
  submission: Submission,
  state: RepositoryState,
  now: string,
): AcceptedSubmissionPlan {
  const folder = getProblemFolderName(problem.frontendId, problem.slug)
  const folderId = `${platform}/${folder}`
  const isNewProblem = state.existingMetadata === null
  const today = now.slice(0, 10)
  const languageChanged =
    state.existingMetadata !== null && state.existingMetadata.language !== submission.language

  const metadata = generateMetadata(platform, problem, submission, state.existingMetadata, now)
  const readme = generateReadme(problem, metadata, submission)
  const solutionFile = generateSolutionFile(submission)

  const deletePaths: string[] = []
  if (languageChanged && state.existingMetadata) {
    const oldExtension = getLanguageInfo(state.existingMetadata.language).extension
    deletePaths.push(`${folderId}/solution.${oldExtension}`)
  }

  const newStats = updateStats(state.stats, problem.difficulty, today, isNewProblem)
  const newTopicIndex = addManyToIndex(state.topicIndex, problem.topics, folderId)

  let newLanguageIndex = state.languageIndex
  if (languageChanged && state.existingMetadata) {
    newLanguageIndex = removeFromIndex(newLanguageIndex, state.existingMetadata.language, folderId)
  }
  newLanguageIndex = addToIndex(newLanguageIndex, submission.language, folderId)

  const newPlatformIndex = addToIndex(state.platformIndex, platform, folderId)

  const newProblemIndex = upsertProblemIndexEntry(state.problemIndex, {
    folderId,
    frontendId: problem.frontendId,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    topics: problem.topics,
    language: submission.language,
    acceptedAt: metadata.acceptedAt,
  })

  const commitFiles: GeneratedFile[] = [
    { path: `${folderId}/README.md`, content: readme },
    { path: `${folderId}/metadata.json`, content: `${JSON.stringify(metadata, null, 2)}\n` },
    { path: `${folderId}/${solutionFile.path}`, content: solutionFile.content },
    toJsonFile(INTERNAL_STATS_PATH, newStats),
    toJsonFile(INTERNAL_TOPIC_INDEX_PATH, newTopicIndex),
    toJsonFile(INTERNAL_LANGUAGE_INDEX_PATH, newLanguageIndex),
    toJsonFile(INTERNAL_PLATFORM_INDEX_PATH, newPlatformIndex),
    toJsonFile(INTERNAL_PROBLEM_INDEX_PATH, newProblemIndex),
  ]

  // The multi-way browsable index is LeetCode-specific by design — other platforms would get
  // their own platform-scoped index README once they exist, not a shared cross-platform one.
  if (platform === LEETCODE_PLATFORM) {
    const leetcodeEntries = newProblemIndex.filter((entry) =>
      entry.folderId.startsWith('leetcode/'),
    )
    commitFiles.push({
      path: LEETCODE_README_PATH,
      content: generateLeetcodeIndexReadme(leetcodeEntries),
    })
  }

  const commitMessage = isNewProblem
    ? `feat(${platform}): solve ${folder}`
    : `feat(${platform}): update ${folder}`

  return { commitFiles, deletePaths, commitMessage }
}
