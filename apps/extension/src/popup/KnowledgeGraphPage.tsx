import { useMemo } from 'react'
import type { NameIndex } from '@algoledger/generators'
import { Reveal } from '../components/Reveal'
import { buildTopicBubbles, packTopicBubbles } from '../utils/knowledge-graph'

interface KnowledgeGraphPageProps {
  topicIndex: NameIndex
}

const GRAPH_SIZE = 400
const MIN_RADIUS_FOR_LABEL = 24

function hashHue(topic: string): number {
  let hash = 0
  for (let i = 0; i < topic.length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
}

export function KnowledgeGraphPage({ topicIndex }: KnowledgeGraphPageProps) {
  const bubbles = useMemo(() => {
    const topicBubbles = buildTopicBubbles(topicIndex)
    return packTopicBubbles(topicBubbles, GRAPH_SIZE)
  }, [topicIndex])

  if (bubbles.length === 0) {
    return (
      <Reveal className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Solve a few problems to see your knowledge graph.
        </p>
      </Reveal>
    )
  }

  return (
    <Reveal className="flex flex-col items-center gap-2 p-4">
      <svg
        viewBox={`0 0 ${GRAPH_SIZE} ${GRAPH_SIZE}`}
        width={GRAPH_SIZE}
        height={GRAPH_SIZE}
        role="img"
        aria-label="Knowledge graph of solved topics"
      >
        {bubbles.map((bubble) => {
          const hue = hashHue(bubble.topic)
          const showLabel = bubble.r >= MIN_RADIUS_FOR_LABEL

          return (
            <g key={bubble.topic} className="transition-opacity duration-200 hover:opacity-80">
              <title>
                {bubble.topic}: {bubble.count} solved
              </title>
              <circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.r}
                fill={`hsl(${hue} 55% 45% / 0.35)`}
                stroke={`hsl(${hue} 55% 60%)`}
                strokeWidth={1}
              />
              {showLabel && (
                <text
                  x={bubble.x}
                  y={bubble.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(14, bubble.r * 0.3)}
                  fill="var(--foreground)"
                  className="pointer-events-none select-none"
                >
                  {bubble.topic}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </Reveal>
  )
}
