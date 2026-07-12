import { z } from 'zod'
import type { Problem } from '@algoledger/schemas'
import { parseHtmlContent } from './parse-html-content'

const topicTagSchema = z.object({ name: z.string() })

const questionSchema = z.object({
  questionId: z.string(),
  questionFrontendId: z.string(),
  title: z.string(),
  titleSlug: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  content: z.string(),
  topicTags: z.array(topicTagSchema),
})

const graphqlResponseSchema = z.object({
  data: z.object({
    question: questionSchema.nullable().optional(),
  }),
})

export function parseGraphqlMetadata(rawBody: unknown): Problem | null {
  const result = graphqlResponseSchema.safeParse(rawBody)
  if (!result.success || !result.data.data.question) {
    return null
  }

  const question = result.data.data.question
  const { statement, examples, constraints } = parseHtmlContent(question.content)

  return {
    problemId: question.questionId,
    frontendId: question.questionFrontendId,
    title: question.title,
    slug: question.titleSlug,
    difficulty: question.difficulty,
    topics: question.topicTags.map((tag) => tag.name),
    companyTags: [],
    statement,
    examples,
    constraints,
    url: `https://leetcode.com/problems/${question.titleSlug}/`,
  }
}
