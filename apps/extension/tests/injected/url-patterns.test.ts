import { describe, expect, test } from 'vitest'
import { shouldIntercept } from '../../src/injected/url-patterns'

describe('shouldIntercept', () => {
  test('matches the real submit endpoint', () => {
    expect(shouldIntercept('https://leetcode.com/problems/two-sum/submit/')).toBe(true)
  })

  test('matches the real check-status polling endpoint', () => {
    expect(shouldIntercept('https://leetcode.com/submissions/detail/2065812218/v2/check/')).toBe(
      true,
    )
  })

  test('matches the real graphql endpoint', () => {
    expect(shouldIntercept('https://leetcode.com/graphql/')).toBe(true)
  })

  test('does not match unrelated page traffic', () => {
    expect(shouldIntercept('https://leetcode.com/api/analytics/track')).toBe(false)
    expect(shouldIntercept('https://www.google-analytics.com/collect')).toBe(false)
    expect(shouldIntercept('https://leetcode.com/problems/two-sum/')).toBe(false)
    expect(shouldIntercept('https://leetcode.com/some/ad/beacon')).toBe(false)
  })
})
