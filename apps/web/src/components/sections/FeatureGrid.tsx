'use client'

import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { BranchIcon, GithubIcon, GridIcon, LockIcon, PulseIcon, ZapIcon } from '../icons/icons'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

interface Feature {
  Icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    Icon: GithubIcon,
    title: 'GitHub-native',
    description: 'No backend, no third-party database — your repository is the whole system.',
  },
  {
    Icon: BranchIcon,
    title: 'Structured commits',
    description: 'One commit per accepted submission — real git history of your growth.',
  },
  {
    Icon: GridIcon,
    title: 'Multi-way indexing',
    description: 'Browse by problem number, difficulty, topic, or language — automatically.',
  },
  {
    Icon: PulseIcon,
    title: 'Activity intelligence',
    description: 'A contribution heatmap and topic radar, generated from your own history.',
  },
  {
    Icon: ZapIcon,
    title: 'Zero manual work',
    description: 'Solve the problem. AlgoLedger captures and commits it in the background.',
  },
  {
    Icon: LockIcon,
    title: 'Own your data',
    description: "It's a plain git repository — exportable, greppable, forkable, forever.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="relative bg-black py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE }}
          className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-white/80"
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE, delay: 0.06 }}
          className="text-center text-xs font-semibold tracking-[0.32em] text-white/50 uppercase"
        >
          Why AlgoLedger
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE, delay: 0.12 }}
          className="mt-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Built like a real engineering artifact
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: HOUSE_EASE, delay: (index % 3) * 0.08 }}
              className="group rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-[transform,box-shadow,border-color] duration-250 ease-out hover:-translate-y-2 hover:border-white/25 hover:shadow-[0_24px_56px_rgba(0,0,0,0.5)]"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white transition-transform group-hover:scale-105">
                <feature.Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
