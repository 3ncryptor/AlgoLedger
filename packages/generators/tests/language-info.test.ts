import { describe, expect, test } from 'vitest'
import { getLanguageInfo } from '../src/language-info'

describe('getLanguageInfo', () => {
  test('maps known LeetCode language slugs to file extension and comment prefix', () => {
    expect(getLanguageInfo('python3')).toEqual({ extension: 'py', commentPrefix: '#' })
    expect(getLanguageInfo('cpp')).toEqual({ extension: 'cpp', commentPrefix: '//' })
    expect(getLanguageInfo('golang')).toEqual({ extension: 'go', commentPrefix: '//' })
  })

  test('falls back to a safe default for unrecognized languages', () => {
    expect(getLanguageInfo('some-new-language')).toEqual({ extension: 'txt', commentPrefix: '#' })
  })
})
