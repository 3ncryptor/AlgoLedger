import { z } from 'zod'
import { DIFFICULTIES } from '@algoledger/shared'

export const problemSchema = z.object({
  problemId: z.string(),
  frontendId: z.string(),
  title: z.string(),
  slug: z.string(),
  difficulty: z.enum(DIFFICULTIES),
  topics: z.array(z.string()),
  companyTags: z.array(z.string()),
  statement: z.string(),
  examples: z.array(z.string()),
  constraints: z.array(z.string()),
  url: z.string(),
})

export type Problem = z.infer<typeof problemSchema>
