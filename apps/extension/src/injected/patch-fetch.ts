export interface InterceptedExchange {
  url: string
  method: string
  requestBody: unknown
  responseBody: unknown
}

export type ExchangeHandler = (exchange: InterceptedExchange) => void

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function patchFetch(onExchange: ExchangeHandler): void {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init)

    try {
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const method = (
        init?.method ?? (input instanceof Request ? input.method : 'GET')
      ).toUpperCase()
      const requestBody =
        init?.body && typeof init.body === 'string' ? safeParseJson(init.body) : null

      response
        .clone()
        .text()
        .then((text) => {
          onExchange({ url, method, requestBody, responseBody: safeParseJson(text) })
        })
        .catch(() => {
          // Swallow: observation must never affect the real fetch outcome.
        })
    } catch {
      // Swallow: observation must never affect the real fetch outcome.
    }

    return response
  }
}
