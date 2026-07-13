import type { ExchangeHandler, UrlFilter } from './patch-fetch'

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const requestMeta = new WeakMap<XMLHttpRequest, { url: string; method: string }>()

type OpenSignature = (
  this: XMLHttpRequest,
  method: string,
  url: string | URL,
  async?: boolean,
  username?: string | null,
  password?: string | null,
) => void

export function patchXhr(onExchange: ExchangeHandler, shouldIntercept: UrlFilter): void {
  const originalOpen = XMLHttpRequest.prototype.open as OpenSignature
  const originalSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function patchedOpen(
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null,
  ) {
    requestMeta.set(this, { url: url.toString(), method: method.toUpperCase() })
    return originalOpen.call(this, method, url, async, username, password)
  }

  XMLHttpRequest.prototype.send = function patchedSend(
    this: XMLHttpRequest,
    body?: Document | XMLHttpRequestBodyInit | null,
  ) {
    this.addEventListener('loadend', () => {
      try {
        const meta = requestMeta.get(this)
        // this.responseURL is the fully-resolved absolute URL (redirect-final); the URL captured
        // at open() time is frequently a page-relative path, which fails every downstream check
        // that expects an absolute https://leetcode.com/... URL. Fall back to it only if
        // responseURL is unavailable (e.g. the request was aborted before completing).
        const url = this.responseURL || meta?.url || ''

        // Skip the expensive responseText read for the vast majority of page traffic that
        // could never be a submit/check/graphql exchange.
        if (!shouldIntercept(url)) return

        const requestBody = typeof body === 'string' ? safeParseJson(body) : null
        onExchange({
          url,
          method: meta?.method ?? 'GET',
          requestBody,
          responseBody: safeParseJson(this.responseText),
        })
      } catch {
        // Swallow: observation must never affect the real XHR outcome.
      }
    })

    return originalSend.call(this, body)
  }
}
