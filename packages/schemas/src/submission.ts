import { z } from 'zod'

export const submissionSchema = z.object({
  submissionId: z.string(),
  questionId: z.string(),
  typedCode: z.string(),
  language: z.string(),
  runtime: z.string().optional(),
  memory: z.string().optional(),
  acceptedAt: z.string().optional(),
})

export type Submission = z.infer<typeof submissionSchema>
