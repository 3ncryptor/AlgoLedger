import { describe, expect, test } from 'vitest'
import { parseVerdictResponse } from '../../src/leetcode/parse-verdict-response'

describe('parseVerdictResponse', () => {
  test('returns pending status for the real PENDING response shape', () => {
    const result = parseVerdictResponse({ state: 'PENDING' })

    expect(result).toEqual({ status: 'pending' })
  })

  test('returns resolved with accepted true when status_code is 10 (Accepted)', () => {
    const body = {
      state: 'SUCCESS',
      status_code: 10,
      status_msg: 'Accepted',
      question_id: '1',
      lang: 'python3',
      status_runtime: '0 ms',
      status_memory: '18 MB',
    }

    const result = parseVerdictResponse(body)

    expect(result).toEqual({
      status: 'resolved',
      accepted: true,
      questionId: '1',
      language: 'python3',
      runtime: '0 ms',
      memory: '18 MB',
    })
  })

  test('returns resolved with accepted false for a non-10 status code (e.g. Wrong Answer = 11)', () => {
    const body = {
      state: 'SUCCESS',
      status_code: 11,
      status_msg: 'Wrong Answer',
      question_id: '1',
      lang: 'python3',
    }

    const result = parseVerdictResponse(body)

    expect(result?.status).toBe('resolved')
    expect(result && result.status === 'resolved' && result.accepted).toBe(false)
  })

  test('returns null when the body does not match the expected shape at all', () => {
    const result = parseVerdictResponse({ unexpected: true })

    expect(result).toBeNull()
  })
})
