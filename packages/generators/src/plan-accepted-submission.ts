import type { Metadata, Problem, Submission } from '@algoledger/schemas'
import type { Platform } from '@algoledger/shared'
import { getProblemFolderName } from './folder-name'
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

export interface RepositoryState {
  existingMetadata: Metadata | null
  stats: Stats
  topicIndex: NameIndex
  languageIndex: NameIndex
  platformIndex: NameIndex
}

export const EMPTY_REPOSITORY_STATE: RepositoryState = {
  existingMetadata: null,
  stats: EMPTY_STATS,
  topicIndex: EMPTY_NAME_INDEX,
  languageIndex: EMPTY_NAME_INDEX,
  platformIndex: EMPTY_NAME_INDEX,
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

  const commitFiles: GeneratedFile[] = [
    { path: `${folderId}/README.md`, content: readme },
    { path: `${folderId}/metadata.json`, content: `${JSON.stringify(metadata, null, 2)}\n` },
    { path: `${folderId}/${solutionFile.path}`, content: solutionFile.content },
    toJsonFile(INTERNAL_STATS_PATH, newStats),
    toJsonFile(INTERNAL_TOPIC_INDEX_PATH, newTopicIndex),
    toJsonFile(INTERNAL_LANGUAGE_INDEX_PATH, newLanguageIndex),
    toJsonFile(INTERNAL_PLATFORM_INDEX_PATH, newPlatformIndex),
  ]

  const commitMessage = isNewProblem
    ? `feat(${platform}): solve ${folder}`
    : `feat(${platform}): update ${folder}`

  return { commitFiles, deletePaths, commitMessage }
}
