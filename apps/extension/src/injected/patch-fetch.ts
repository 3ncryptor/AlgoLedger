export interface InterceptedExchange {
  url: string
  method: string
  requestBody: unknown
  responseBody: unknown
}

export type ExchangeHandler = (exchange: InterceptedExchange) => void
export type UrlFilter = (url: string) => boolean

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function patchFetch(onExchange: ExchangeHandler, shouldIntercept: UrlFilter): void {
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init)

    try {
      // response.url is always the fully-resolved absolute URL (redirect-final), unlike the raw
      // `input` argument, which is frequently a page-relative path (e.g. "/problems/two-sum/
      // submit/") — matching against that directly silently failed every downstream check that
      // expects an absolute https://leetcode.com/... URL.
      const url = response.url

      // Skip the expensive clone+read for the vast majority of page traffic (analytics, ads,
      // unrelated API calls) that could never be a submit/check/graphql exchange.
      if (!shouldIntercept(url)) return response

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
