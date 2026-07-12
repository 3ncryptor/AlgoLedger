import { describe, expect, test } from 'vitest'
import { ALGOLEDGER_MESSAGE_SOURCE, isAcceptedSubmissionMessage } from '../../src/types/messages'

describe('isAcceptedSubmissionMessage', () => {
  test('returns true for a correctly tagged message', () => {
    const message = {
      source: ALGOLEDGER_MESSAGE_SOURCE,
      submission: { questionId: '1', language: 'python3', typedCode: 'pass', submissionId: '1' },
      problem: {
        problemId: '1',
        frontendId: '1',
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        topics: [],
        companyTags: [],
        statement: '',
        examples: [],
        constraints: [],
        url: '',
      },
    }

    expect(isAcceptedSubmissionMessage(message)).toBe(true)
  })

  test('returns false for messages from other sources (e.g. the page itself)', () => {
    expect(isAcceptedSubmissionMessage({ source: 'some-other-extension' })).toBe(false)
  })

  test('returns false for null, undefined, and non-object values', () => {
    expect(isAcceptedSubmissionMessage(null)).toBe(false)
    expect(isAcceptedSubmissionMessage(undefined)).toBe(false)
    expect(isAcceptedSubmissionMessage('a string')).toBe(false)
    expect(isAcceptedSubmissionMessage(42)).toBe(false)
  })
})
