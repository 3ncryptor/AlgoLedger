import { describe, expect, test } from 'vitest'
import { parseGraphqlMetadata } from '../../src/leetcode/parse-graphql-metadata'

describe('parseGraphqlMetadata', () => {
  test('extracts a fully-formed Problem from the real questionDetail response shape', () => {
    const body = {
      data: {
        question: {
          title: 'Two Sum',
          titleSlug: 'two-sum',
          questionId: '1',
          questionFrontendId: '1',
          difficulty: 'Easy',
          content:
            '<p>Given an array...</p><p><strong class="example">Example 1:</strong></p><pre>Input: []</pre>',
          companyTagStatsV2: null,
          topicTags: [
            { name: 'Array', slug: 'array', translatedName: null },
            { name: 'Hash Table', slug: 'hash-table', translatedName: null },
          ],
        },
      },
    }

    const result = parseGraphqlMetadata(body)

    expect(result?.problemId).toBe('1')
    expect(result?.frontendId).toBe('1')
    expect(result?.title).toBe('Two Sum')
    expect(result?.slug).toBe('two-sum')
    expect(result?.difficulty).toBe('Easy')
    expect(result?.topics).toEqual(['Array', 'Hash Table'])
    expect(result?.companyTags).toEqual([])
    expect(result?.url).toBe('https://leetcode.com/problems/two-sum/')
  })

  test('ignores unrelated large graphql fields (languageList, statusList, etc.) without breaking', () => {
    const body = {
      data: {
        languageList: [{ id: 0, name: 'cpp' }],
        statusList: [{ id: 10, name: 'Accepted' }],
        question: {
          title: 'Two Sum',
          titleSlug: 'two-sum',
          questionId: '1',
          questionFrontendId: '1',
          difficulty: 'Easy',
          content: '<p>Statement</p>',
          topicTags: [{ name: 'Array' }],
        },
      },
    }

    const result = parseGraphqlMetadata(body)

    expect(result?.title).toBe('Two Sum')
  })

  test('returns null when the question field is null (e.g. an unrelated graphql query)', () => {
    const result = parseGraphqlMetadata({ data: { question: null } })

    expect(result).toBeNull()
  })

  test('returns null for a malformed response', () => {
    const result = parseGraphqlMetadata({ foo: 'bar' })

    expect(result).toBeNull()
  })
})
