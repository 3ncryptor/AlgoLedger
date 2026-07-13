import type { NameIndex } from '@algoledger/generators'

export type RadarAnchor = 'start' | 'middle' | 'end'

export interface RadarAxis {
  topic: string
  percent: number
  x: number
  y: number
  axisX: number
  axisY: number
  labelX: number
  labelY: number
  anchor: RadarAnchor
}

export interface RadarChartData {
  size: number
  center: number
  maxRadius: number
  axes: RadarAxis[]
}

const MAX_AXES = 6
const MIN_AXES = 3
const LABEL_OFFSET = 22
const ANCHOR_THRESHOLD = 0.3

function getAnchor(cosValue: number): RadarAnchor {
  if (cosValue > ANCHOR_THRESHOLD) return 'start'
  if (cosValue < -ANCHOR_THRESHOLD) return 'end'
  return 'middle'
}

export function buildTopicRadar(
  topicIndex: NameIndex,
  totalSolved: number,
  size: number,
): RadarChartData {
  const center = size / 2
  const maxRadius = center - LABEL_OFFSET - 8

  const topTopics = Object.entries(topicIndex)
    .map(([topic, entries]) => ({ topic, count: entries.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_AXES)

  if (topTopics.length < MIN_AXES || totalSolved === 0) {
    return { size, center, maxRadius, axes: [] }
  }

  const axisCount = topTopics.length

  const axes = topTopics.map(({ topic, count }, index) => {
    const percent = Math.round((count / totalSolved) * 100)
    const angle = -Math.PI / 2 + index * ((2 * Math.PI) / axisCount)
    const radius = (percent / 100) * maxRadius
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)

    return {
      topic,
      percent,
      x: center + radius * cosAngle,
      y: center + radius * sinAngle,
      axisX: center + maxRadius * cosAngle,
      axisY: center + maxRadius * sinAngle,
      labelX: center + (maxRadius + LABEL_OFFSET) * cosAngle,
      labelY: center + (maxRadius + LABEL_OFFSET) * sinAngle,
      anchor: getAnchor(cosAngle),
    }
  })

  return { size, center, maxRadius, axes }
}
