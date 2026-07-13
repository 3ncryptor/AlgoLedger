import type { LeetCodeAdapter } from '@algoledger/adapters'

const QUESTION_DATA_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      questionFrontendId
      title
      titleSlug
      difficulty
      content
      topicTags {
        name
      }
    }
  }
`

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match?.[1] ?? null
}

export function extractTitleSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/problems\/([\w-]+)/)
  return match?.[1] ?? null
}

/**
 * LeetCode's app frequently fetches question metadata once on initial page load and serves it
 * from a client-side cache on later renders, so the GraphQL request our passive network
 * interception depends on may never happen again during a session. This fetches it directly
 * using the page's own authenticated session (cookies are sent automatically for this
 * same-origin request) as a fallback when nothing was observed passively.
 */
export async function fetchQuestionMetadata(
  adapter: LeetCodeAdapter,
  titleSlug: string,
): Promise<void> {
  const csrfToken = getCsrfToken()

  const response = await window.fetch('/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'x-csrftoken': csrfToken } : {}),
    },
    body: JSON.stringify({
      operationName: 'questionData',
      query: QUESTION_DATA_QUERY,
      variables: { titleSlug },
    }),
  })

  const body: unknown = await response.json()
  adapter.recordMetadataResponse(body)
}
