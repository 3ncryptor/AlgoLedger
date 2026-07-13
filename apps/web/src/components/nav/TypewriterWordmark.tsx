'use client'

import { useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

const WORD = 'AlgoLedger'
const TYPE_SPEED_MS = 90
const HOLD_MS = 3500
const CLEAR_MS = 400
const PAUSE_MS = 800

type Phase = 'typing' | 'holding' | 'clearing' | 'pausing'

interface TypewriterWordmarkProps {
  className?: string
}

/** Loops: types "AlgoLedger" out, holds, clears, pauses, retypes — an ambient re-run of the
 * reveal alongside the navbar logo, not a one-shot mount animation. */
export function TypewriterWordmark({ className }: TypewriterWordmarkProps) {
  const [phase, setPhase] = useState<Phase>('typing')
  const [charCount, setCharCount] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || phase !== 'typing') return
    if (charCount >= WORD.length) {
      const timeout = setTimeout(() => setPhase('holding'), 0)
      return () => clearTimeout(timeout)
    }
    const timeout = setTimeout(() => setCharCount((count) => count + 1), TYPE_SPEED_MS)
    return () => clearTimeout(timeout)
  }, [phase, charCount, reducedMotion])

  useEffect(() => {
    if (reducedMotion || phase !== 'holding') return
    const timeout = setTimeout(() => setPhase('clearing'), HOLD_MS)
    return () => clearTimeout(timeout)
  }, [phase, reducedMotion])

  useEffect(() => {
    if (reducedMotion || phase !== 'clearing') return
    const timeout = setTimeout(() => {
      setCharCount(0)
      setPhase('pausing')
    }, CLEAR_MS)
    return () => clearTimeout(timeout)
  }, [phase, reducedMotion])

  useEffect(() => {
    if (reducedMotion || phase !== 'pausing') return
    const timeout = setTimeout(() => setPhase('typing'), PAUSE_MS)
    return () => clearTimeout(timeout)
  }, [phase, reducedMotion])

  const typed = reducedMotion ? WORD : WORD.slice(0, charCount)
  const showCursor = !reducedMotion && (phase === 'typing' || phase === 'holding')

  return (
    <span
      className={`inline-flex items-center text-lg font-semibold tracking-tight text-white sm:text-xl ${className ?? ''}`}
    >
      {typed}
      {showCursor && (
        <span className="ml-0.5 inline-block h-[1em] w-px animate-pulse bg-white/70" />
      )}
    </span>
  )
}
