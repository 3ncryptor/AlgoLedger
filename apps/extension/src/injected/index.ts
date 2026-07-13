import { LeetCodeAdapter } from '@algoledger/adapters'
import { ALGOLEDGER_MESSAGE_SOURCE } from '../types/messages'
import { extractTitleSlugFromPath, fetchQuestionMetadata } from './fetch-question-metadata'
import { patchFetch, type InterceptedExchange } from './patch-fetch'
import { patchXhr } from './patch-xhr'
import { postAcceptedSubmission } from './post-message'
import {
  CHECK_PATH_PATTERN,
  GRAPHQL_PATH_PATTERN,
  SUBMIT_PATH_PATTERN,
  shouldIntercept,
} from './url-patterns'

const adapters = [new LeetCodeAdapter()]

async function handleAcceptedVerdict(adapter: LeetCodeAdapter): Promise<void> {
  try {
    const submission = adapter.captureSubmission()

    let problem
    try {
      problem = adapter.fetchMetadata()
    } catch {
      // The questionDetail GraphQL call wasn't observed passively this session (LeetCode's app
      // often serves it from a client-side cache after the first page load) — fetch it directly.
      const titleSlug = extractTitleSlugFromPath(window.location.pathname)
      if (!titleSlug) throw new Error('Could not determine problem slug from the current URL')
      await fetchQuestionMetadata(adapter, titleSlug)
      problem = adapter.fetchMetadata()
    }

    postAcceptedSubmission({ source: ALGOLEDGER_MESSAGE_SOURCE, submission, problem })
  } catch {
    // Metadata still unavailable even after the active fallback, or the submission was
    // otherwise incomplete — drop this signal rather than posting a partial one.
  }
}

function handleExchange(exchange: InterceptedExchange): void {
  const adapter = adapters.find((candidate) => candidate.canHandle(exchange.url))
  if (!adapter) return

  if (exchange.method === 'POST' && SUBMIT_PATH_PATTERN.test(exchange.url)) {
    adapter.recordSubmissionRequest(exchange.requestBody)
    adapter.recordSubmissionResponse(exchange.responseBody)
    return
  }

  if (CHECK_PATH_PATTERN.test(exchange.url)) {
    if (!adapter.isAccepted(exchange.responseBody)) return
    adapter.recordVerdict(exchange.responseBody)

    void handleAcceptedVerdict(adapter)
    return
  }

  if (GRAPHQL_PATH_PATTERN.test(exchange.url)) {
    adapter.recordMetadataResponse(exchange.responseBody)
  }
}

patchFetch(handleExchange, shouldIntercept)
patchXhr(handleExchange, shouldIntercept)
