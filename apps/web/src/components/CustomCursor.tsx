'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (prefersReducedMotion || isCoarsePointer) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 })

    const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' })
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' })
    const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

    function handleMove(event: PointerEvent) {
      moveDotX(event.clientX)
      moveDotY(event.clientY)
      moveRingX(event.clientX)
      moveRingY(event.clientY)
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-100 hidden md:block" aria-hidden="true">
      <div
        ref={ringRef}
        className="fixed top-0 left-0 size-8 rounded-full border border-white/30"
      />
      <div ref={dotRef} className="fixed top-0 left-0 size-1.5 rounded-full bg-white" />
    </div>
  )
}
