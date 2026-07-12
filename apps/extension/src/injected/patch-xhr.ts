import type { ExchangeHandler } from './patch-fetch'

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

export function patchXhr(onExchange: ExchangeHandler): void {
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
        const requestBody = typeof body === 'string' ? safeParseJson(body) : null
        onExchange({
          url: meta?.url ?? '',
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
