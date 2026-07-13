'use client'

import { useGSAP } from '@gsap/react'
import { useMemo, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { buildMultiLineWordmarkGrid } from '../../lib/heatmap-font'

interface HeatmapLogoProps {
  lines?: string[]
  gap?: number
  className?: string
  label?: string
}

type CellLevel = 0 | 1 | 2 | 3 | 4

interface Cell {
  row: number
  col: number
  lit: boolean
  level: CellLevel
}

const HEATMAP_LEVEL_CLASS = [
  'bg-heatmap-0',
  'bg-heatmap-1',
  'bg-heatmap-2',
  'bg-heatmap-3',
  'bg-heatmap-4',
]
const NOISE_CHANCE = 0.045
const AMBIENT_PULSE_MIN_DELAY_MS = 1400
const AMBIENT_PULSE_MAX_DELAY_MS = 3200

// Deterministic pseudo-random in [0, 1) from a numeric seed — avoids Math.random() during
// render, which would otherwise produce a server/client hydration mismatch in Next.js.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildCells(grid: boolean[][]): Cell[] {
  const cells: Cell[] = []

  grid.forEach((row, rowIndex) => {
    row.forEach((lit, colIndex) => {
      const seed = rowIndex * 1000 + colIndex

      if (lit) {
        // Letter cells stay in the two brightest tiers only — legibility matters more here than
        // the "organic activity" variance a real contribution graph would have.
        const level = (3 + Math.floor(seededRandom(seed) * 2)) as CellLevel
        cells.push({ row: rowIndex, col: colIndex, lit: true, level })
        return
      }

      const isNoise = seededRandom(seed + 0.5) < NOISE_CHANCE
      cells.push({ row: rowIndex, col: colIndex, lit: false, level: isNoise ? 1 : 0 })
    })
  })

  return cells
}

export function HeatmapLogo({
  lines = ['Algo', 'Ledger'],
  gap = 3,
  className,
  label,
}: HeatmapLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  const grid = useMemo(() => buildMultiLineWordmarkGrid(lines), [lines])
  const cells = useMemo(() => buildCells(grid), [grid])
  const rowCount = grid.length
  const colCount = grid[0]?.length ?? 0

  // Phase 1: the whole grid — lit and unlit cells alike — fades/scales in together at a uniform
  // resting level, so it reads as a blank contribution graph "lining up" first. Only once that
  // settles does phase 2 (below) light up the cells that spell the wordmark.
  useGSAP(
    () => {
      const container = containerRef.current
      if (!container) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const targets = gsap.utils.toArray<HTMLElement>('[data-cell]', container)

      if (reducedMotion) {
        gsap.set(targets, { opacity: 1, scale: 1 })
        setRevealed(true)
        return
      }

      gsap.set(targets, { opacity: 0, scale: 0.5 })
      gsap.to(targets, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        stagger: (_index, target) => Number((target as HTMLElement).dataset.col) * 0.012,
      })

      const entranceSeconds = 0.4 + colCount * 0.012
      const timeoutId = setTimeout(() => setRevealed(true), entranceSeconds * 1000 + 250)

      return () => clearTimeout(timeoutId)
    },
    { scope: containerRef, dependencies: [cells, colCount] },
  )

  // Phase 2: once the grid has lined up, the letter cells brighten from resting (level 0, via the
  // `revealed` class swap below) to their final bright level — a CSS color transition — with a
  // small GSAP scale-pop layered on top so it reads as "committing" rather than just fading.
  useGSAP(
    () => {
      if (!revealed) return
      const container = containerRef.current
      if (!container) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const litTargets = gsap.utils.toArray<HTMLElement>('[data-lit="true"]', container)
      if (litTargets.length === 0 || reducedMotion) return

      gsap.set(litTargets, { scale: 0.85 })
      gsap.to(litTargets, {
        scale: 1,
        duration: 0.3,
        ease: 'back.out(2)',
        stagger: (_index, target) => Number((target as HTMLElement).dataset.col) * 0.01,
      })

      let cancelled = false
      let timeoutId: ReturnType<typeof setTimeout>

      function schedulePulse() {
        const delay =
          AMBIENT_PULSE_MIN_DELAY_MS +
          Math.random() * (AMBIENT_PULSE_MAX_DELAY_MS - AMBIENT_PULSE_MIN_DELAY_MS)

        timeoutId = setTimeout(() => {
          if (cancelled) return
          const target = litTargets[Math.floor(Math.random() * litTargets.length)]!
          gsap.to(target, {
            scale: 1.4,
            duration: 0.25,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          })
          schedulePulse()
        }, delay)
      }

      schedulePulse()

      return () => {
        cancelled = true
        clearTimeout(timeoutId)
      }
    },
    { scope: containerRef, dependencies: [revealed, cells] },
  )

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label ?? lines.join(' ')}
      className={className}
      style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns: `repeat(${colCount}, 1fr)`,
        gridTemplateRows: `repeat(${rowCount}, 1fr)`,
        gap,
      }}
    >
      {cells.map((cell) => {
        const displayLevel = cell.lit && !revealed ? 0 : cell.level
        return (
          <div
            key={`${cell.row}-${cell.col}`}
            data-cell
            data-col={cell.col}
            data-lit={cell.lit}
            className={`rounded-[15%] transition-colors duration-500 ease-out ${HEATMAP_LEVEL_CLASS[displayLevel]}`}
            style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
          />
        )
      })}
    </div>
  )
}
