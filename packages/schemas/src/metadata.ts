import { z } from 'zod'
import { PLATFORMS, DIFFICULTIES } from '@algoledger/shared'

export const metadataSchema = z.object({
  platform: z.enum(PLATFORMS),
  problemId: z.string(),
  frontendId: z.string(),
  title: z.string(),
  slug: z.string(),
  difficulty: z.enum(DIFFICULTIES),
  topics: z.array(z.string()),
  companyTags: z.array(z.string()),
  language: z.string(),
  runtime: z.string(),
  memory: z.string(),
  submissionId: z.string(),
  acceptedAt: z.string(),
  updatedAt: z.string(),
  url: z.string(),
  version: z.number().int().positive(),
})

export type Metadata = z.infer<typeof metadataSchema>
