import { z } from 'zod'
import { ACCEPTED_STATUS_CODE } from './constants'

const verdictResponseSchema = z.object({
  state: z.string(),
  status_code: z.number().optional(),
  status_msg: z.string().optional(),
  question_id: z.union([z.string(), z.number()]).optional(),
  lang: z.string().optional(),
  status_runtime: z.string().optional(),
  status_memory: z.string().optional(),
})

export type VerdictResult =
  | { status: 'pending' }
  | {
      status: 'resolved'
      accepted: boolean
      questionId: string
      language: string
      runtime: string
      memory: string
    }

export function parseVerdictResponse(rawBody: unknown): VerdictResult | null {
  const result = verdictResponseSchema.safeParse(rawBody)
  if (!result.success) {
    return null
  }

  const { state, status_code, question_id, lang, status_runtime, status_memory } = result.data

  if (state !== 'SUCCESS') {
    return { status: 'pending' }
  }

  return {
    status: 'resolved',
    accepted: status_code === ACCEPTED_STATUS_CODE,
    questionId: question_id === undefined ? '' : String(question_id),
    language: lang ?? '',
    runtime: status_runtime ?? '',
    memory: status_memory ?? '',
  }
}
