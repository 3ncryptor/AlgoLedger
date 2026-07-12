import type { AcceptedSubmissionMessage } from '../types/messages'

export function postAcceptedSubmission(message: AcceptedSubmissionMessage): void {
  window.postMessage(message, window.location.origin)
}
