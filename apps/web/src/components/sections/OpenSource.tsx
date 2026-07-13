'use client'

import { motion } from 'framer-motion'
import type { ComponentType, CSSProperties, PointerEvent } from 'react'
import { BranchIcon, GithubIcon, GridIcon, TerminalIcon } from '../icons/icons'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

const STACK = ['TypeScript', 'pnpm workspaces', 'Turborepo', 'Manifest V3', 'Next.js', 'Zod']

interface Idea {
  Icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const IDEAS: Idea[] = [
  {
    Icon: BranchIcon,
    title: 'Add a platform adapter',
    description: 'Extend capture beyond LeetCode — Codeforces and HackerRank are already stubbed.',
  },
  {
    Icon: GridIcon,
    title: 'Improve the popup UI',
    description: 'Polish the dashboard, the knowledge graph, or the onboarding flow.',
  },
  {
    Icon: TerminalIcon,
    title: 'Write more tests',
    description: 'Strengthen coverage across generators, adapters, and the sync engine.',
  },
]

function handleSpotlightMove(event: PointerEvent<HTMLDivElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}

function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  return (
    <motion.div
      onPointerMove={handleSpotlightMove}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: HOUSE_EASE, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/25"
      style={{ '--spot-x': '50%', '--spot-y': '50%' } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(200px circle at var(--spot-x) var(--spot-y), rgba(255,255,255,0.08), transparent 70%)',
        }}
      />
      <div className="relative flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-transform group-hover:scale-105">
          <idea.Icon className="size-4.5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{idea.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/50">{idea.description}</p>
        </div>
      </div>
      <span className="relative mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.65rem] text-white/50">
        Good first issue
      </span>
    </motion.div>
  )
}

export function OpenSource() {
  return (
    <section id="open-source" className="relative overflow-hidden bg-black py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE }}
          className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-white/80"
        />
        <p className="text-center text-xs font-semibold tracking-[0.32em] text-white/50 uppercase">
          Build in Public
        </p>
        <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Come read the code. Come change it.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="flex flex-col">
            <p className="text-sm leading-relaxed text-white/55">
              AlgoLedger is a pnpm/Turborepo monorepo, fully typed, built on the principle that
              GitHub is the database — no hidden backend to reverse-engineer. Every part of the
              pipeline, from capture to commit, is right here for you to read.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {STACK.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.3, ease: HOUSE_EASE, delay: index * 0.05 }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                >
                  {tech}
                </motion.span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/3ncryptor/AlgoLedger"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform active:scale-[0.97]"
              >
                <GithubIcon className="size-4" />
                Star &amp; contribute
              </a>
              <a
                href="https://github.com/3ncryptor/AlgoLedger/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 active:scale-[0.97]"
              >
                Browse open issues
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {IDEAS.map((idea, index) => (
              <IdeaCard key={idea.title} idea={idea} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
