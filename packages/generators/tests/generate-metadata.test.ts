import { describe, expect, test } from 'vitest'
import { generateMetadata } from '../src/generate-metadata'
import { acceptedSubmission, twoSumProblem } from './fixtures'

describe('generateMetadata', () => {
  test('produces version 1 for a brand new problem', () => {
    const metadata = generateMetadata(
      'leetcode',
      twoSumProblem,
      acceptedSubmission,
      null,
      '2026-07-13T10:00:00.000Z',
    )

    expect(metadata.version).toBe(1)
    expect(metadata.platform).toBe('leetcode')
    expect(metadata.problemId).toBe('1')
    expect(metadata.frontendId).toBe('1')
    expect(metadata.title).toBe('Two Sum')
    expect(metadata.language).toBe('python3')
    expect(metadata.runtime).toBe('0 ms')
    expect(metadata.memory).toBe('18 MB')
  })

  test('increments the version when existing metadata is provided', () => {
    const existing = generateMetadata(
      'leetcode',
      twoSumProblem,
      acceptedSubmission,
      null,
      '2026-07-13T10:00:00.000Z',
    )
    const updated = generateMetadata(
      'leetcode',
      twoSumProblem,
      acceptedSubmission,
      existing,
      '2026-07-14T10:00:00.000Z',
    )

    expect(updated.version).toBe(2)
  })

  test('falls back to "now" for acceptedAt when the submission has none', () => {
    const submissionWithoutAcceptedAt = { ...acceptedSubmission, acceptedAt: undefined }
    const metadata = generateMetadata(
      'leetcode',
      twoSumProblem,
      submissionWithoutAcceptedAt,
      null,
      '2026-07-13T10:00:00.000Z',
    )

    expect(metadata.acceptedAt).toBe('2026-07-13T10:00:00.000Z')
  })
})
