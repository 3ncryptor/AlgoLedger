import { beforeEach, describe, expect, test } from 'vitest'
import { LeetCodeAdapter } from '../../src/leetcode/leetcode-adapter'

describe('LeetCodeAdapter', () => {
  let adapter: LeetCodeAdapter

  beforeEach(() => {
    adapter = new LeetCodeAdapter()
  })

  test('canHandle returns true only for leetcode.com URLs', () => {
    expect(adapter.canHandle('https://leetcode.com/problems/two-sum/')).toBe(true)
    expect(adapter.canHandle('https://codeforces.com/problemset')).toBe(false)
  })

  test('isAccepted returns true only when the verdict status_code is 10', () => {
    expect(adapter.isAccepted({ state: 'SUCCESS', status_code: 10 })).toBe(true)
    expect(adapter.isAccepted({ state: 'SUCCESS', status_code: 11 })).toBe(false)
    expect(adapter.isAccepted({ state: 'PENDING' })).toBe(false)
  })

  test('captures a full submission after recording the real request, response, and an accepted verdict', () => {
    adapter.recordSubmissionRequest({ question_id: '1', lang: 'python3', typed_code: 'pass' })
    adapter.recordSubmissionResponse({ submission_id: 2065366985 })
    adapter.recordVerdict({
      state: 'SUCCESS',
      status_code: 10,
      question_id: '1',
      lang: 'python3',
      status_runtime: '0 ms',
      status_memory: '18 MB',
    })

    const submission = adapter.captureSubmission()

    expect(submission.questionId).toBe('1')
    expect(submission.language).toBe('python3')
    expect(submission.submissionId).toBe('2065366985')
    expect(submission.runtime).toBe('0 ms')
    expect(submission.memory).toBe('18 MB')
    expect(submission.acceptedAt).toBeTruthy()
  })

  test('captureSubmission throws when no submission has been recorded yet', () => {
    expect(() => adapter.captureSubmission()).toThrow()
  })

  test('fetchMetadata returns the cached Problem matching the current submission questionId', () => {
    adapter.recordMetadataResponse({
      data: {
        question: {
          questionId: '1',
          questionFrontendId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'Easy',
          content: '<p>Statement</p>',
          topicTags: [{ name: 'Array' }],
        },
      },
    })
    adapter.recordSubmissionRequest({ question_id: '1', lang: 'python3', typed_code: 'pass' })

    const problem = adapter.fetchMetadata()

    expect(problem.title).toBe('Two Sum')
  })

  test('fetchMetadata throws when no metadata has been cached for the current question', () => {
    adapter.recordSubmissionRequest({ question_id: '999', lang: 'python3', typed_code: 'pass' })

    expect(() => adapter.fetchMetadata()).toThrow()
  })
})
