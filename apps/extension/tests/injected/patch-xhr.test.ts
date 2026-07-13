import { beforeEach, describe, expect, test, vi } from 'vitest'
import { patchXhr } from '../../src/injected/patch-xhr'

class FakeXhr {
  responseURL = ''
  responseText = ''
  private listeners: Record<string, Array<() => void>> = {}

  open(_method: string, _url: string | URL, _async?: boolean): void {}
  send(_body?: unknown): void {}

  addEventListener(type: string, listener: () => void): void {
    ;(this.listeners[type] ??= []).push(listener)
  }

  fireLoadEnd(): void {
    for (const listener of this.listeners.loadend ?? []) listener()
  }
}

describe('patchXhr', () => {
  beforeEach(() => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr)
  })

  test('skips the expensive responseText read when the resolved URL fails the filter', () => {
    const onExchange = vi.fn()
    const shouldIntercept = vi.fn(() => false)
    patchXhr(onExchange, shouldIntercept)

    const xhr = new XMLHttpRequest() as unknown as FakeXhr
    xhr.open('GET', '/unrelated/path')
    xhr.responseURL = 'https://leetcode.com/unrelated/path'
    xhr.send()
    xhr.fireLoadEnd()

    expect(shouldIntercept).toHaveBeenCalledWith('https://leetcode.com/unrelated/path')
    expect(onExchange).not.toHaveBeenCalled()
  })

  test('uses the resolved absolute responseURL, not the page-relative url passed to open()', () => {
    const onExchange = vi.fn()
    patchXhr(onExchange, () => true)

    const xhr = new XMLHttpRequest() as unknown as FakeXhr
    // LeetCode's own polling code calls open() with a page-relative path.
    xhr.open('GET', '/submissions/detail/2065812218/v2/check/')
    xhr.responseURL = 'https://leetcode.com/submissions/detail/2065812218/v2/check/'
    xhr.responseText = '{"state":"SUCCESS","status_code":10}'
    xhr.send()
    xhr.fireLoadEnd()

    expect(onExchange).toHaveBeenCalledWith({
      url: 'https://leetcode.com/submissions/detail/2065812218/v2/check/',
      method: 'GET',
      requestBody: null,
      responseBody: { state: 'SUCCESS', status_code: 10 },
    })
  })

  test('falls back to the open()-time url when responseURL is unavailable (e.g. aborted)', () => {
    const onExchange = vi.fn()
    patchXhr(onExchange, () => true)

    const xhr = new XMLHttpRequest() as unknown as FakeXhr
    xhr.open('GET', 'https://leetcode.com/graphql/')
    // responseURL left as '' (unavailable)
    xhr.send()
    xhr.fireLoadEnd()

    expect(onExchange).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://leetcode.com/graphql/' }),
    )
  })
})
