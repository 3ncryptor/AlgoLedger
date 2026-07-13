import { beforeEach, describe, expect, test, vi } from 'vitest'
import { patchFetch, type InterceptedExchange } from '../../src/injected/patch-fetch'

function createResponseMock(url: string, body: string) {
  return {
    url,
    clone: vi.fn(() => ({ text: vi.fn().mockResolvedValue(body) })),
  }
}

describe('patchFetch', () => {
  let originalFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalFetch = vi.fn()
    vi.stubGlobal('window', { fetch: originalFetch })
    vi.stubGlobal('Request', class {})
  })

  test('skips the expensive clone+read when the resolved URL fails the filter', async () => {
    const response = createResponseMock('https://leetcode.com/unrelated/path', '{}')
    originalFetch.mockResolvedValue(response)
    const onExchange = vi.fn()
    const shouldIntercept = vi.fn(() => false)

    patchFetch(onExchange, shouldIntercept)
    await window.fetch('/unrelated/path')

    expect(shouldIntercept).toHaveBeenCalledWith('https://leetcode.com/unrelated/path')
    expect(response.clone).not.toHaveBeenCalled()
    expect(onExchange).not.toHaveBeenCalled()
  })

  test('reports the resolved absolute response.url, not the raw (possibly relative) input', async () => {
    const response = createResponseMock(
      'https://leetcode.com/problems/two-sum/submit/',
      '{"submission_id":"123"}',
    )
    originalFetch.mockResolvedValue(response)
    const onExchange = vi.fn<(exchange: InterceptedExchange) => void>()

    patchFetch(onExchange, () => true)
    // The page calls fetch with a page-relative path, exactly like LeetCode's own code does.
    await window.fetch('/problems/two-sum/submit/', {
      method: 'POST',
      body: '{"lang":"python3"}',
    })
    await vi.waitFor(() => expect(onExchange).toHaveBeenCalled())

    expect(onExchange).toHaveBeenCalledWith({
      url: 'https://leetcode.com/problems/two-sum/submit/',
      method: 'POST',
      requestBody: { lang: 'python3' },
      responseBody: { submission_id: '123' },
    })
  })
})
