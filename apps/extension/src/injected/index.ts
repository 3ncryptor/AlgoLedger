import { LeetCodeAdapter } from '@algoledger/adapters'
import { ALGOLEDGER_MESSAGE_SOURCE } from '../types/messages'
import { patchFetch, type InterceptedExchange } from './patch-fetch'
import { patchXhr } from './patch-xhr'
import { postAcceptedSubmission } from './post-message'

const SUBMIT_PATH_PATTERN = /\/problems\/[\w-]+\/submit\/?$/
const CHECK_PATH_PATTERN = /\/submissions\/detail\/\d+\/(?:v2\/)?check\/?$/
const GRAPHQL_PATH_PATTERN = /\/graphql\/?$/

const adapters = [new LeetCodeAdapter()]

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

    try {
      const submission = adapter.captureSubmission()
      const problem = adapter.fetchMetadata()
      postAcceptedSubmission({ source: ALGOLEDGER_MESSAGE_SOURCE, submission, problem })
    } catch {
      // Metadata not cached yet or submission incomplete — drop this signal.
    }
    return
  }

  if (GRAPHQL_PATH_PATTERN.test(exchange.url)) {
    adapter.recordMetadataResponse(exchange.responseBody)
  }
}

patchFetch(handleExchange)
patchXhr(handleExchange)
