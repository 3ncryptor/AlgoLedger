import type { Metadata, Problem, Submission } from '@algoledger/schemas'
import type { Platform } from '@algoledger/shared'

export function generateMetadata(
  platform: Platform,
  problem: Problem,
  submission: Submission,
  existing: Metadata | null,
  now: string,
): Metadata {
  return {
    platform,
    problemId: problem.problemId,
    frontendId: problem.frontendId,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    topics: problem.topics,
    companyTags: problem.companyTags,
    language: submission.language,
    runtime: submission.runtime ?? '',
    memory: submission.memory ?? '',
    submissionId: submission.submissionId,
    acceptedAt: submission.acceptedAt ?? now,
    updatedAt: now,
    url: problem.url,
    version: (existing?.version ?? 0) + 1,
  }
}
