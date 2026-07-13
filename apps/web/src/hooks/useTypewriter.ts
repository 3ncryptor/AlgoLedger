'use client'

import { useEffect, useState } from 'react'

interface UseTypewriterOptions {
  active: boolean
  speed?: number
  startDelay?: number
}

interface TypewriterResult {
  typed: string
  done: boolean
}

/** Reveals `text` one character at a time while `active` is true, resetting when it goes false
 * so the effect can replay the next time the caller becomes active again (e.g. a scene re-entering
 * view). Respects prefers-reduced-motion by revealing the full text immediately. */
export function useTypewriter(
  text: string,
  { active, speed = 28, startDelay = 0 }: UseTypewriterOptions,
): TypewriterResult {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!active) {
      setTyped('')
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(text)
      return
    }

    let index = 0
    let intervalId: ReturnType<typeof setInterval> | undefined

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        index += 1
        setTyped(text.slice(0, index))
        if (index >= text.length && intervalId) clearInterval(intervalId)
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [active, text, speed, startDelay])

  return { typed, done: typed.length === text.length }
}
