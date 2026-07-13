'use client'

import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { gsap, registerGsapPlugins } from '../../lib/gsap'

const README_ROWS = [
  { number: '0001', title: 'Two Sum', difficulty: 'Easy' },
  { number: '0015', title: '3Sum', difficulty: 'Medium' },
  { number: '0146', title: 'LRU Cache', difficulty: 'Hard' },
  { number: '0200', title: 'Number of Islands', difficulty: 'Medium' },
]

const TOPIC_TAGS = ['Array (24)', 'Hash Table (18)', 'Dynamic Programming (11)', 'Graph (9)']

const HEATMAP_WEEKS = 26
const HEATMAP_DAYS = 7

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const HEATMAP_LEVEL_CLASS = [
  'bg-heatmap-0',
  'bg-heatmap-1',
  'bg-heatmap-2',
  'bg-heatmap-3',
  'bg-heatmap-4',
]

const HEATMAP_CELLS = Array.from({ length: HEATMAP_WEEKS }, (_, week) =>
  Array.from({ length: HEATMAP_DAYS }, (_, day) => {
    const roll = seededRandom(week * 7 + day)
    if (roll < 0.45) return 0
    if (roll < 0.7) return 1
    if (roll < 0.85) return 2
    if (roll < 0.95) return 3
    return 4
  }),
)

export function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([])
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      registerGsapPlugins()

      const rows = rowRefs.current.filter((el): el is HTMLDivElement => el !== null)
      const tags = tagRefs.current.filter((el): el is HTMLSpanElement => el !== null)
      const cells = cellRefs.current.filter((el): el is HTMLDivElement => el !== null)

      gsap.set(rows, { opacity: 0, x: -12 })
      gsap.set(tags, { opacity: 0, y: 8 })
      gsap.set(cells, { opacity: 0.15, scale: 0.7 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: 1,
        },
      })

      timeline.to(rows, { opacity: 1, x: 0, stagger: 0.12, duration: 0.3 }, 0)
      timeline.to(tags, { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 }, 0.3)
      timeline.to(
        cells,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: (_index, target) => Number((target as HTMLElement).dataset.week) * 0.02,
        },
        0.2,
      )
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="relative bg-black py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-white/80" />
        <p className="text-center text-xs font-semibold tracking-[0.32em] text-white/50 uppercase">
          Real product, not a mockup
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your repository, browsable
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6">
            <p className="mb-4 font-mono text-xs text-white/40">leetcode/README.md</p>
            <div className="flex flex-col gap-2">
              {README_ROWS.map((row, index) => (
                <div
                  key={row.number}
                  ref={(el) => {
                    rowRefs.current[index] = el
                  }}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
                >
                  <span className="font-mono text-white/50">{row.number}</span>
                  <span className="text-white/85">{row.title}</span>
                  <span className="text-xs text-white/40">{row.difficulty}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOPIC_TAGS.map((tag, index) => (
                <span
                  key={tag}
                  ref={(el) => {
                    tagRefs.current[index] = el
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.02] p-6">
            <p className="mb-4 font-mono text-xs text-white/40">Contribution heatmap</p>
            <div className="flex flex-1 items-center">
              <div className="flex w-full gap-1">
                {HEATMAP_CELLS.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-1 flex-col gap-1">
                    {week.map((level, dayIndex) => (
                      <div
                        key={dayIndex}
                        ref={(el) => {
                          cellRefs.current[weekIndex * HEATMAP_DAYS + dayIndex] = el
                        }}
                        data-week={weekIndex}
                        className={`aspect-square w-full rounded-[2px] ${HEATMAP_LEVEL_CLASS[level]}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
