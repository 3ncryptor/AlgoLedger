'use client'

import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'
import { gsap, ScrollTrigger, registerGsapPlugins } from '../lib/gsap'

interface SmoothScrollProviderProps {
  children: ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    registerGsapPlugins()

    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)

    function raf(time: number) {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
