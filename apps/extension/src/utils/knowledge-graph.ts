import { hierarchy, pack, type HierarchyNode } from 'd3-hierarchy'
import type { NameIndex } from '@algoledger/generators'

export interface TopicBubble {
  topic: string
  count: number
}

export interface PackedTopicBubble extends TopicBubble {
  x: number
  y: number
  r: number
}

type BubbleNode = { children: TopicBubble[] } | TopicBubble

function bubbleCount(node: BubbleNode): number {
  return 'count' in node ? node.count : 0
}

export function buildTopicBubbles(topicIndex: NameIndex): TopicBubble[] {
  return Object.entries(topicIndex)
    .map(([topic, entries]) => ({ topic, count: entries.length }))
    .sort((a, b) => b.count - a.count)
}

export function packTopicBubbles(bubbles: TopicBubble[], size: number): PackedTopicBubble[] {
  if (bubbles.length === 0) return []

  const root: HierarchyNode<BubbleNode> = hierarchy<BubbleNode>({ children: bubbles }).sum(
    bubbleCount,
  )

  const packedRoot = pack<BubbleNode>().size([size, size]).padding(2)(root)

  return (packedRoot.children ?? []).map((node) => {
    const data = node.data as TopicBubble
    return { topic: data.topic, count: data.count, x: node.x, y: node.y, r: node.r }
  })
}
