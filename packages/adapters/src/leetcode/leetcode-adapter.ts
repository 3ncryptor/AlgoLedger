import type { Problem, Submission } from '@algoledger/schemas'
import type { PlatformAdapter } from '../platform-adapter'
import { parseSubmitRequest } from './parse-submit-request'
import { parseSubmitResponse } from './parse-submit-response'
import { parseVerdictResponse } from './parse-verdict-response'
import { parseGraphqlMetadata } from './parse-graphql-metadata'

const LEETCODE_URL_PATTERN = /^https:\/\/(www\.)?leetcode\.com\//

export class LeetCodeAdapter implements PlatformAdapter {
  private pendingSubmission: Partial<Submission> = {}
  private metadataCache = new Map<string, Problem>()

  canHandle(url: string): boolean {
    return LEETCODE_URL_PATTERN.test(url)
  }

  recordSubmissionRequest(rawBody: unknown): void {
    const parsed = parseSubmitRequest(rawBody)
    if (!parsed) return

    this.pendingSubmission = {
      questionId: parsed.questionId,
      language: parsed.language,
      typedCode: parsed.typedCode,
    }
  }

  recordSubmissionResponse(rawBody: unknown): void {
    const submissionId = parseSubmitResponse(rawBody)
    if (!submissionId) return

    this.pendingSubmission.submissionId = submissionId
  }

  recordMetadataResponse(rawBody: unknown): void {
    const problem = parseGraphqlMetadata(rawBody)
    if (!problem) return

    this.metadataCache.set(problem.problemId, problem)
  }

  isAccepted(result: unknown): boolean {
    const verdict = parseVerdictResponse(result)
    return verdict?.status === 'resolved' && verdict.accepted
  }

  recordVerdict(rawBody: unknown): void {
    const verdict = parseVerdictResponse(rawBody)
    if (!verdict || verdict.status !== 'resolved') return

    this.pendingSubmission.runtime = verdict.runtime
    this.pendingSubmission.memory = verdict.memory
    this.pendingSubmission.acceptedAt = new Date().toISOString()
  }

  captureSubmission(): Submission {
    const { questionId, language, typedCode, submissionId } = this.pendingSubmission
    if (!questionId || !language || !typedCode || !submissionId) {
      throw new Error('No completed submission available to capture')
    }

    return {
      questionId,
      language,
      typedCode,
      submissionId,
      runtime: this.pendingSubmission.runtime,
      memory: this.pendingSubmission.memory,
      acceptedAt: this.pendingSubmission.acceptedAt,
    }
  }

  fetchMetadata(): Problem {
    const questionId = this.pendingSubmission.questionId
    const problem = questionId ? this.metadataCache.get(questionId) : undefined
    if (!problem) {
      throw new Error('No metadata cached for the current submission')
    }

    return problem
  }
}
