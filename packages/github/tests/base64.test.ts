import { describe, expect, test } from 'vitest'
import { decodeBase64, encodeBase64 } from '../src/base64'

describe('encodeBase64 / decodeBase64', () => {
  test('round-trips plain ASCII text', () => {
    const text = 'class Solution:\n    pass\n'

    expect(decodeBase64(encodeBase64(text))).toBe(text)
  })

  test('round-trips UTF-8 text with non-ASCII characters', () => {
    const text = 'π ≈ 3.14159, café, 日本語'

    expect(decodeBase64(encodeBase64(text))).toBe(text)
  })

  test('decodes base64 content with embedded newlines, as returned by the GitHub contents API', () => {
    const text = 'hello world'
    const base64 = encodeBase64(text)
    const withNewlines = base64.match(/.{1,4}/g)?.join('\n') ?? base64

    expect(decodeBase64(withNewlines)).toBe(text)
  })
})
