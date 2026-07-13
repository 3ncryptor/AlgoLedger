'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTypewriter } from '../../../hooks/useTypewriter'

const CLONE_COMMAND = 'git clone https://github.com/3ncryptor/AlgoLedger.git'
const LINE_REVEAL_MS = 220

// Real `git clone` transcript — each line is what git actually prints once its own step
// finishes, not a synthetic percentage widget.
const GIT_LOG_LINES = [
  "Cloning into 'AlgoLedger'...",
  'remote: Enumerating objects: 342, done.',
  'remote: Counting objects: 100% (342/342), done.',
  'remote: Compressing objects: 100% (198/198), done.',
  'remote: Total 342 (delta 156), reused 298 (delta 112), pack-reused 0',
  'Receiving objects: 100% (342/342), 1.24 MiB | 3.87 MiB/s, done.',
  'Resolving deltas: 100% (156/156), done.',
]

type Stage = 'typing' | 'cloning' | 'browser' | 'clicking' | 'loaded'

interface CloneSceneProps {
  isActive: boolean
}

export function CloneScene({ isActive }: CloneSceneProps) {
  const [stage, setStage] = useState<Stage>('typing')
  const [lineIndex, setLineIndex] = useState(0)
  const { typed, done: typedDone } = useTypewriter(CLONE_COMMAND, { active: isActive, speed: 22 })

  useEffect(() => {
    if (!isActive || !typedDone || stage !== 'typing') return
    const timeout = setTimeout(() => setStage('cloning'), 350)
    return () => clearTimeout(timeout)
  }, [isActive, typedDone, stage])

  useEffect(() => {
    if (stage !== 'cloning') return
    const interval = setInterval(() => {
      setLineIndex((value) => Math.min(GIT_LOG_LINES.length, value + 1))
    }, LINE_REVEAL_MS)
    return () => clearInterval(interval)
  }, [stage])

  useEffect(() => {
    if (stage !== 'cloning' || lineIndex < GIT_LOG_LINES.length) return
    const timeout = setTimeout(() => setStage('browser'), 500)
    return () => clearTimeout(timeout)
  }, [stage, lineIndex])

  useEffect(() => {
    if (stage !== 'browser') return
    const timeout = setTimeout(() => setStage('clicking'), 900)
    return () => clearTimeout(timeout)
  }, [stage])

  useEffect(() => {
    if (stage !== 'clicking') return
    const timeout = setTimeout(() => setStage('loaded'), 500)
    return () => clearTimeout(timeout)
  }, [stage])

  const showBrowserPanel = stage === 'browser' || stage === 'clicking' || stage === 'loaded'

  return (
    <div className="flex h-full flex-col gap-1.5 overflow-auto bg-black p-6 font-mono text-[0.85rem] text-white/80">
      <p>
        <span className="text-white/40">$</span> {typed}
        {!typedDone && (
          <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-white/70 align-middle" />
        )}
      </p>

      {stage !== 'typing' &&
        GIT_LOG_LINES.slice(0, lineIndex).map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={
              line.startsWith('remote:')
                ? 'text-white/35'
                : index === GIT_LOG_LINES.length - 1
                  ? 'text-heatmap-4'
                  : 'text-white/60'
            }
          >
            {line}
          </motion.p>
        ))}

      {showBrowserPanel && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-2 rounded-lg border border-white/10 bg-white/5 p-3.5"
        >
          <div className="flex items-center justify-between text-xs">
            <span>Developer mode</span>
            <span className="rounded-full bg-white/90 px-2 py-0.5 font-semibold text-black">
              On
            </span>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <motion.span
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: stage === 'clicking' ? [1, 0.7, 1.15, 1] : 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="size-2.5 rounded-full border-2 border-white bg-white/30"
            />
            <motion.span
              animate={{ scale: stage === 'clicking' ? [1, 0.94, 1] : 1 }}
              transition={{ duration: 0.35 }}
              className={`w-fit rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                stage === 'loaded' ? 'bg-heatmap-4 text-black' : 'bg-white text-black'
              }`}
            >
              {stage === 'loaded' ? 'Loaded ✓' : 'Load unpacked'}
            </motion.span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
