'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../../lib/gsap'

type Step = 'token' | 'repo' | 'confirm' | 'done'

const STEPS: Step[] = ['token', 'repo', 'confirm', 'done']
const STEP_LABELS: Record<Step, string> = {
  token: 'Connect GitHub',
  repo: 'Choose repository',
  confirm: 'Confirm & connect',
  done: 'Done',
}
const REPOS = ['AlgoLedger', 'leetcode-journal', 'interview-notes']

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3"
      aria-hidden="true"
    >
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  )
}

function StepRail({ step }: { step: Step }) {
  const currentIndex = STEPS.indexOf(step)

  return (
    <div className="flex w-56 shrink-0 flex-col gap-1 border-r border-white/10 p-6">
      {STEPS.map((s, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        return (
          <div key={s} className="flex items-center gap-3 py-2">
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold transition-colors ${
                isDone
                  ? 'bg-heatmap-4 text-black'
                  : isCurrent
                    ? 'border border-white bg-transparent text-white'
                    : 'border border-white/15 text-white/30'
              }`}
            >
              {isDone ? <CheckIcon /> : index + 1}
            </span>
            <span
              className={`text-xs font-medium transition-colors ${
                isCurrent ? 'text-white' : isDone ? 'text-white/60' : 'text-white/30'
              }`}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ConnectScene() {
  const [step, setStep] = useState<Step>('token')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cursor = cursorRef.current
    if (!cursor) return

    const blink = gsap.to(cursor, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })

    return () => {
      blink.kill()
    }
  }, [])

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-heatmap-4" />
          <span className="text-sm font-semibold text-white">AlgoLedger Setup</span>
        </div>
        <span className="text-xs text-white/30">Step {STEPS.indexOf(step) + 1} of 4</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <StepRail step={step} />

        <div className="flex flex-1 items-center justify-center p-10">
          <div className="w-full max-w-md">
            {step === 'token' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-2xl font-semibold text-white">Connect GitHub</p>
                <p className="mt-2 text-sm text-white/50">
                  Paste a fine-grained personal access token with repo scope.
                </p>
                <div className="mt-6 flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white/60">
                  ghp_••••••••••••••••••••
                  <span ref={cursorRef} className="ml-0.5 inline-block h-4 w-px bg-white/60" />
                </div>
                <button
                  type="button"
                  onClick={() => setStep('repo')}
                  className="mt-6 w-full rounded-lg bg-white py-3 text-center text-sm font-semibold text-black transition-transform active:scale-[0.97]"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 'repo' && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-2xl font-semibold text-white">Choose a repository</p>
                <p className="mt-2 text-sm text-white/50">Where should AlgoLedger commit to?</p>
                <div className="mt-6 flex flex-col gap-2">
                  {REPOS.map((repo) => (
                    <button
                      key={repo}
                      type="button"
                      onClick={() => {
                        setSelectedRepo(repo)
                        setStep('confirm')
                      }}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 transition-colors hover:border-white/25 hover:bg-white/10 active:scale-[0.98]"
                    >
                      {repo}
                      <span className="text-white/30">→</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setStep('token')}
                  className="mt-5 text-xs text-white/40 transition-colors hover:text-white/70"
                >
                  ← Back
                </button>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-2xl font-semibold text-white">Confirm &amp; connect</p>
                <div className="mt-6 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <span className="text-white/80">{selectedRepo}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                    main
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('done')}
                  className="mt-6 w-full rounded-lg bg-white py-3 text-center text-sm font-semibold text-black transition-transform active:scale-[0.97]"
                >
                  Connect
                </button>
                <button
                  type="button"
                  onClick={() => setStep('repo')}
                  className="mt-3 text-xs text-white/40 transition-colors hover:text-white/70"
                >
                  ← Back
                </button>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-4 text-center"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-heatmap-4/15 text-heatmap-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-7"
                    aria-hidden="true"
                  >
                    <path d="M4 12.5 9.5 18 20 6" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-white">Connected to {selectedRepo}</p>
                <p className="text-sm text-white/50">Every accepted submission commits here now.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
