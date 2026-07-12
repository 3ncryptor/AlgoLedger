import { describe, expect, test } from 'vitest'
import { parseSubmitResponse } from '../../src/leetcode/parse-submit-response'

describe('parseSubmitResponse', () => {
  test('extracts and stringifies a numeric submission_id, matching the real LeetCode response shape', () => {
    const result = parseSubmitResponse({ submission_id: 2065366985 })

    expect(result).toBe('2065366985')
  })

  test('accepts a string submission_id too', () => {
    const result = parseSubmitResponse({ submission_id: '2065366985' })

    expect(result).toBe('2065366985')
  })

  test('returns null when submission_id is missing', () => {
    const result = parseSubmitResponse({})

    expect(result).toBeNull()
  })
})
