'use client'

import { useGSAP } from '@gsap/react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useRef, type CSSProperties } from 'react'
import { gsap, registerGsapPlugins } from '../../lib/gsap'
import { getMultiLineAspectRatio } from '../../lib/heatmap-font'
import { HeatmapLogo } from '../hero/HeatmapLogo'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const
const WORDMARK_LINES = ['ALGO', 'LEDGER']

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const blobARef = useRef<HTMLDivElement>(null)
  const blobBRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const aspectRatio = useMemo(() => getMultiLineAspectRatio(WORDMARK_LINES), [])

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      registerGsapPlugins()

      const scrollTrigger = {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }

      gsap.to(blobARef.current, { y: 120, ease: 'none', scrollTrigger })
      gsap.to(blobBRef.current, { y: -80, ease: 'none', scrollTrigger })
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black py-20"
    >
      <div
        ref={blobARef}
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-32 size-96 rounded-full bg-white/[0.04] blur-3xl"
      />
      <div
        ref={blobBRef}
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-white/[0.03] blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: HOUSE_EASE }}
        style={
          {
            '--wordmark-h': `min(80vh, calc(92vw / ${aspectRatio}))`,
            height: 'var(--wordmark-h)',
            width: `calc(var(--wordmark-h) * ${aspectRatio})`,
            WebkitMaskImage:
              'radial-gradient(ellipse 95% 95% at center, black 88%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 95% 95% at center, black 88%, transparent 100%)',
          } as CSSProperties
        }
      >
        <HeatmapLogo lines={WORDMARK_LINES} label="AlgoLedger" />
      </motion.div>

      {!reducedMotion && (
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-[0.65rem] tracking-widest uppercase">Scroll</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </motion.div>
      )}
    </section>
  )
}
