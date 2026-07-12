import { z } from 'zod'

const submitRequestSchema = z.object({
  question_id: z.string(),
  lang: z.string(),
  typed_code: z.string(),
})

export interface ParsedSubmitRequest {
  questionId: string
  language: string
  typedCode: string
}

export function parseSubmitRequest(rawBody: unknown): ParsedSubmitRequest | null {
  const result = submitRequestSchema.safeParse(rawBody)
  if (!result.success) {
    return null
  }

  return {
    questionId: result.data.question_id,
    language: result.data.lang,
    typedCode: result.data.typed_code,
  }
}
