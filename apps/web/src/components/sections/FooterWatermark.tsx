'use client'

import { useEffect, useRef } from 'react'

export function FooterWatermark() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function handleMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect()
      container!.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
      container!.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
    }

    container.addEventListener('pointermove', handleMove)
    return () => container.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
    >
      <span className="text-[5rem] font-black tracking-tight text-white/[0.04] sm:text-[7rem] md:text-[9rem]">
        ALGOLEDGER
      </span>
      <span
        className="absolute text-[5rem] font-black tracking-tight text-white sm:text-[7rem] md:text-[9rem]"
        style={{
          WebkitMaskImage:
            'radial-gradient(circle 180px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), white, transparent 100%)',
          maskImage:
            'radial-gradient(circle 180px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), white, transparent 100%)',
        }}
      >
        ALGOLEDGER
      </span>
    </div>
  )
}
