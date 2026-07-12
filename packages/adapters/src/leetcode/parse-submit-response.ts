import { z } from 'zod'

const submitResponseSchema = z.object({
  submission_id: z.union([z.string(), z.number()]),
})

export function parseSubmitResponse(rawBody: unknown): string | null {
  const result = submitResponseSchema.safeParse(rawBody)
  if (!result.success) {
    return null
  }

  return String(result.data.submission_id)
}
