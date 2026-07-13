import { beforeEach, describe, expect, test, vi } from 'vitest'
import { LeetCodeAdapter } from '@algoledger/adapters'
import {
  extractTitleSlugFromPath,
  fetchQuestionMetadata,
} from '../../src/injected/fetch-question-metadata'

describe('extractTitleSlugFromPath', () => {
  test('extracts the slug from a plain problem page path', () => {
    expect(extractTitleSlugFromPath('/problems/two-sum/')).toBe('two-sum')
  })

  test('extracts the slug when a trailing section is present', () => {
    expect(extractTitleSlugFromPath('/problems/two-sum/description/')).toBe('two-sum')
    expect(extractTitleSlugFromPath('/problems/number-of-islands/submissions/')).toBe(
      'number-of-islands',
    )
  })

  test('returns null for a non-problem path', () => {
    expect(extractTitleSlugFromPath('/discuss/general')).toBeNull()
  })
})

describe('fetchQuestionMetadata', () => {
  let originalFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalFetch = vi.fn()
    vi.stubGlobal('window', { fetch: originalFetch })
    vi.stubGlobal('document', { cookie: 'csrftoken=abc123; other=value' })
  })

  test('sends the questionData query with the csrf header and records the response', async () => {
    const graphqlBody = {
      data: {
        question: {
          questionId: '1',
          questionFrontendId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'Easy',
          content: '<p>Given an array...</p>',
          topicTags: [{ name: 'Array' }],
        },
      },
    }
    originalFetch.mockResolvedValue({ json: vi.fn().mockResolvedValue(graphqlBody) })

    const adapter = new LeetCodeAdapter()
    await fetchQuestionMetadata(adapter, 'two-sum')

    expect(originalFetch).toHaveBeenCalledWith(
      '/graphql/',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-csrftoken': 'abc123' }),
      }),
    )

    const [, init] = originalFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body.operationName).toBe('questionData')
    expect(body.variables).toEqual({ titleSlug: 'two-sum' })

    // Metadata should now be cached on the adapter, resolvable via captureSubmission's pair.
    adapter.recordSubmissionRequest({ question_id: '1', lang: 'python3', typed_code: 'x' })
    const problem = adapter.fetchMetadata()
    expect(problem.title).toBe('Two Sum')
    expect(problem.slug).toBe('two-sum')
  })
})
