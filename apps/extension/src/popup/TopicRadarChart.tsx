import { useMemo } from 'react'
import type { NameIndex } from '@algoledger/generators'
import { buildTopicRadar } from '../utils/topic-radar'

interface TopicRadarChartProps {
  topicIndex: NameIndex
  totalSolved: number
}

const CHART_SIZE = 180
const RADAR_COLOR = '#39d353'

export function TopicRadarChart({ topicIndex, totalSolved }: TopicRadarChartProps) {
  const radar = useMemo(
    () => buildTopicRadar(topicIndex, totalSolved, CHART_SIZE),
    [topicIndex, totalSolved],
  )

  if (radar.axes.length === 0) {
    return (
      <p className="max-w-40 text-xs text-muted-foreground">
        Solve problems across a few more topics to see your activity radar.
      </p>
    )
  }

  const polygonPoints = radar.axes.map((axis) => `${axis.x},${axis.y}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${radar.size} ${radar.size}`}
      width={radar.size}
      height={radar.size}
      role="img"
      aria-label="Radar chart of top solved topics"
    >
      {radar.axes.map((axis) => (
        <line
          key={`axis-${axis.topic}`}
          x1={radar.center}
          y1={radar.center}
          x2={axis.axisX}
          y2={axis.axisY}
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}

      <polygon
        points={polygonPoints}
        fill={RADAR_COLOR}
        fillOpacity={0.35}
        stroke={RADAR_COLOR}
        strokeWidth={1.5}
      />

      {radar.axes.map((axis) => (
        <circle key={`dot-${axis.topic}`} cx={axis.x} cy={axis.y} r={2.5} fill={RADAR_COLOR} />
      ))}

      {radar.axes.map((axis) => (
        <text
          key={`label-${axis.topic}`}
          x={axis.labelX}
          y={axis.labelY}
          textAnchor={axis.anchor}
          dominantBaseline="middle"
          fontSize={9}
          fill="var(--muted-foreground)"
        >
          <tspan x={axis.labelX} dy="-0.4em" fontWeight={600} fill="var(--foreground)">
            {axis.percent}%
          </tspan>
          <tspan x={axis.labelX} dy="1.1em">
            {axis.topic}
          </tspan>
        </text>
      ))}
    </svg>
  )
}
