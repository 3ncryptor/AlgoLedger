import type { Submission } from '@algoledger/schemas'
import { getLanguageInfo } from './language-info'

export interface GeneratedFile {
  path: string
  content: string
}

export function generateSolutionFile(submission: Submission): GeneratedFile {
  const { extension, commentPrefix } = getLanguageInfo(submission.language)
  const header =
    submission.runtime && submission.memory
      ? `${commentPrefix} Runtime: ${submission.runtime}\n${commentPrefix} Memory: ${submission.memory}\n\n`
      : ''

  return {
    path: `solution.${extension}`,
    content: `${header}${submission.typedCode}`,
  }
}
