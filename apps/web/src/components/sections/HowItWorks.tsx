'use client'

import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { gsap, registerGsapPlugins, ScrollTrigger } from '../../lib/gsap'
import { CloneScene } from './how-it-works/CloneScene'
import { CommitScene } from './how-it-works/CommitScene'
import { ConnectScene } from './how-it-works/ConnectScene'
import { Laptop } from './how-it-works/Laptop'
import { SolveScene } from './how-it-works/SolveScene'
import { BrowserChrome, WindowChrome } from './how-it-works/WindowChrome'

interface Scene {
  index: string
  title: string
  render: (isActive: boolean) => React.ReactNode
}

// Each scene remounts (via `key`) whenever it flips active/inactive — React's recommended way
// to reset a subtree's local state on a condition change, instead of calling setState in an
// effect. This is also exactly what we want here: re-entering a scene should always restart its
// internal sequence (typing, wizard steps, submit result) from the top.
const SCENES: Scene[] = [
  {
    index: '01',
    title: 'Clone & load the extension',
    render: (isActive) => (
      <WindowChrome key={String(isActive)} title="zsh — Terminal">
        <CloneScene isActive={isActive} />
      </WindowChrome>
    ),
  },
  {
    index: '02',
    title: 'Connect your GitHub',
    render: (isActive) => (
      <BrowserChrome key={String(isActive)} url="chrome-extension://algoledger/onboarding.html">
        <ConnectScene />
      </BrowserChrome>
    ),
  },
  {
    index: '03',
    title: 'Solve on LeetCode',
    render: (isActive) => (
      <BrowserChrome key={String(isActive)} url="leetcode.com/problems/two-sum">
        <SolveScene />
      </BrowserChrome>
    ),
  },
  {
    index: '04',
    title: 'Watch it land',
    render: (isActive) => (
      <BrowserChrome key={String(isActive)} url="github.com/3ncryptor/AlgoLedger">
        <CommitScene />
      </BrowserChrome>
    ),
  },
]

const SCENE_UNIT = 1
const FADE_DURATION = 0.3
const HOLD_DURATION = 0.7
const LINE_REVEAL_OFFSET = 0.15

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const underlineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lastActiveIndex = useRef(0)
  const [activeScene, setActiveScene] = useState(0)

  useGSAP(
    () => {
      const scenes = sceneRefs.current.filter((el): el is HTMLDivElement => el !== null)
      const labels = labelRefs.current.filter((el): el is HTMLDivElement => el !== null)
      const underlines = underlineRefs.current.filter((el): el is HTMLSpanElement => el !== null)
      if (scenes.length === 0) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(scenes, { opacity: 1, scale: 1 })
        gsap.set(labels, { opacity: 1, color: '#ffffff' })
        gsap.set(underlines, { scaleX: 1 })
        return
      }

      registerGsapPlugins()
      gsap.set(scenes.slice(1), { opacity: 0, y: 16, scale: 0.92 })
      gsap.set(labels, { color: 'rgba(255,255,255,0.4)' })
      gsap.set(labels[0]!, { color: 'rgba(255,255,255,1)' })
      gsap.set(underlines, { scaleX: 0 })
      gsap.set(underlines[0]!, { scaleX: 1 })

      const timeline = gsap.timeline()

      scenes.forEach((scene, index) => {
        const start = index * SCENE_UNIT

        if (index > 0) {
          timeline.to(scene, { opacity: 1, y: 0, scale: 1, duration: FADE_DURATION }, start)
          timeline.to(
            labels[index]!,
            { opacity: 1, color: 'rgba(255,255,255,1)', duration: FADE_DURATION },
            start,
          )
          timeline.to(underlines[index]!, { scaleX: 1, duration: FADE_DURATION }, start)
        }

        // Internal detail reveals — every scene's own content lines stagger in, synced to
        // this scene's own slice of scroll rather than firing all at once.
        const lines = gsap.utils.toArray<HTMLElement>('[data-anim="line"]', scene)
        if (lines.length > 0) {
          gsap.set(lines, { opacity: 0, y: 8 })
          timeline.to(
            lines,
            { opacity: 1, y: 0, duration: 0.25, stagger: 0.09 },
            start + LINE_REVEAL_OFFSET,
          )
        }

        const checkPath = scene.querySelector<SVGPathElement>('[data-anim="check"]')
        if (checkPath) {
          const length = checkPath.getTotalLength()
          gsap.set(checkPath, { strokeDasharray: length, strokeDashoffset: length })
          timeline.to(
            checkPath,
            { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' },
            start + 0.3,
          )
        }

        const dot = scene.querySelector<HTMLElement>('[data-anim="dot"]')
        if (dot) {
          gsap.set(dot, { scale: 0 })
          timeline.to(dot, { scale: 1.4, duration: 0.2, ease: 'back.out(3)' }, start + 0.15)
          timeline.to(dot, { scale: 1, duration: 0.15 }, start + 0.35)
        }

        if (index < scenes.length - 1) {
          timeline.to(
            scene,
            { opacity: 0, y: -16, scale: 1.05, duration: FADE_DURATION },
            start + HOLD_DURATION,
          )
          timeline.to(
            labels[index]!,
            { opacity: 0.4, color: 'rgba(255,255,255,0.4)', duration: FADE_DURATION },
            start + HOLD_DURATION,
          )
          timeline.to(
            underlines[index]!,
            { scaleX: 0, duration: FADE_DURATION },
            start + HOLD_DURATION,
          )
        }
      })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${scenes.length * 100}%`,
        scrub: 1,
        pin: pinRef.current,
        animation: timeline,
        onUpdate: (self) => {
          const rawIndex = Math.round((self.progress * timeline.duration()) / SCENE_UNIT)
          const clamped = Math.min(scenes.length - 1, Math.max(0, rawIndex))
          if (clamped !== lastActiveIndex.current) {
            lastActiveIndex.current = clamped
            setActiveScene(clamped)
          }
        },
      })
    },
    { scope: sectionRef },
  )

  return (
    <section id="how-it-works" ref={sectionRef} className="relative bg-black">
      <div ref={pinRef} className="relative flex h-screen flex-col overflow-hidden px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 py-20">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {SCENES.map((scene, index) => (
              <div
                key={scene.index}
                ref={(el) => {
                  labelRefs.current[index] = el
                }}
                className="flex flex-col items-center gap-1.5 text-xs font-medium sm:text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="text-white/30">{scene.index}</span>
                  {scene.title}
                </span>
                <span
                  ref={(el) => {
                    underlineRefs.current[index] = el
                  }}
                  className="h-0.5 w-full rounded-full bg-white"
                />
              </div>
            ))}
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            <Laptop>
              {SCENES.map((scene, index) => (
                <div
                  key={scene.index}
                  ref={(el) => {
                    sceneRefs.current[index] = el
                  }}
                  className="absolute inset-0"
                  style={{ pointerEvents: activeScene === index ? 'auto' : 'none' }}
                >
                  {scene.render(activeScene === index)}
                </div>
              ))}
            </Laptop>
          </div>
        </div>
      </div>
    </section>
  )
}
