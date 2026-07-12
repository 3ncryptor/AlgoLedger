import { describe, expect, test } from 'vitest'
import { parseSubmitRequest } from '../../src/leetcode/parse-submit-request'

describe('parseSubmitRequest', () => {
  test('extracts questionId, language, and typedCode from a real submit request body', () => {
    const body = {
      lang: 'python3',
      question_id: '1',
      typed_code:
        'class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for idx, val in enumerate(nums):\n            complement = target - val\n            if complement in seen:\n                return [seen[complement], idx]\n            seen[val] = idx\n        return []\n',
    }

    const result = parseSubmitRequest(body)

    expect(result).toEqual({
      questionId: '1',
      language: 'python3',
      typedCode: body.typed_code,
    })
  })

  test('returns null when required fields are missing', () => {
    const result = parseSubmitRequest({ lang: 'python3' })

    expect(result).toBeNull()
  })

  test('returns null for non-object input', () => {
    const result = parseSubmitRequest('not an object')

    expect(result).toBeNull()
  })
})
