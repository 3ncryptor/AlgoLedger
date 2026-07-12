const EXAMPLE_MARKER = /<strong class="example">Example \d+:<\/strong>/gi
const CONSTRAINTS_MARKER = /<p>\s*<strong>\s*Constraints:\s*<\/strong>\s*<\/p>/i

export interface ParsedStatement {
  statement: string
  examples: string[]
  constraints: string[]
}

export function parseHtmlContent(html: string): ParsedStatement {
  const constraintsMatch = CONSTRAINTS_MARKER.exec(html)
  const beforeConstraints = constraintsMatch ? html.slice(0, constraintsMatch.index) : html
  const afterConstraints = constraintsMatch
    ? html.slice(constraintsMatch.index + constraintsMatch[0].length)
    : ''

  const exampleMarkers = [...beforeConstraints.matchAll(EXAMPLE_MARKER)]
  const firstExampleIndex = exampleMarkers[0]?.index
  const statement = (
    firstExampleIndex === undefined
      ? beforeConstraints
      : beforeConstraints.slice(0, firstExampleIndex)
  ).trim()

  const examples = exampleMarkers.map((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length
    const end = exampleMarkers[index + 1]?.index ?? beforeConstraints.length
    return beforeConstraints.slice(start, end).trim()
  })

  const listMatch = /<ul>([\s\S]*?)<\/ul>/i.exec(afterConstraints)
  const listContent = listMatch?.[1] ?? ''
  const constraints = listMatch
    ? [...listContent.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((match) => (match[1] ?? '').trim())
    : []

  return { statement, examples, constraints }
}
