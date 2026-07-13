'use client'

import { motion } from 'framer-motion'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

interface ComparisonRow {
  generic: string
  algoledger: string
}

const ROWS: ComparisonRow[] = [
  {
    generic: 'Just pushes raw source files',
    algoledger: 'Generates README + metadata + solution',
  },
  {
    generic: 'One flat folder, no organization',
    algoledger: 'Multi-way index: topic, difficulty, language',
  },
  { generic: 'No activity insight', algoledger: 'Contribution heatmap + topic radar built in' },
  {
    generic: 'Manual copy-paste after every solve',
    algoledger: 'Fully automatic, silent capture',
  },
]

const LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const ROW_VARIANTS = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: HOUSE_EASE } },
}

const ROW_VARIANTS_RIGHT = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: HOUSE_EASE } },
}

function XMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-4 shrink-0 text-white/30"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function CheckMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0 text-heatmap-4"
      aria-hidden="true"
    >
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  )
}

export function Positioning() {
  return (
    <section className="relative bg-black py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE }}
          className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-white/80"
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE, delay: 0.05 }}
          className="text-center text-xs font-semibold tracking-[0.32em] text-white/50 uppercase"
        >
          Positioning
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE, delay: 0.1 }}
          className="mt-3 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          This isn&apos;t another tracker
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: HOUSE_EASE, delay: 0.15 }}
          className="mx-auto mt-4 max-w-xl text-center text-sm text-white/55"
        >
          Most LeetHub-style tools just dump your code into a repo. AlgoLedger builds a structured,
          categorized knowledge base out of it.
        </motion.p>

        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={LIST_VARIANTS}
            className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6"
          >
            <p className="mb-4 text-sm font-semibold text-white/50">Generic code-dump tools</p>
            <div className="flex flex-col gap-3">
              {ROWS.map((row) => (
                <motion.div
                  key={row.generic}
                  variants={ROW_VARIANTS}
                  className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/[0.03]"
                >
                  <XMark />
                  {row.generic}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, ease: HOUSE_EASE, delay: 0.4 }}
              className="relative flex size-10 items-center justify-center rounded-full border border-white/15 bg-black text-[0.65rem] font-bold text-white/70"
            >
              <motion.span
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.6, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border border-white/20"
              />
              VS
            </motion.span>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={LIST_VARIANTS}
            className="rounded-[2rem] border border-white/20 bg-white/[0.04] p-6 shadow-[0_24px_56px_rgba(0,0,0,0.4)]"
          >
            <p className="mb-4 text-sm font-semibold text-white">AlgoLedger</p>
            <div className="flex flex-col gap-3">
              {ROWS.map((row) => (
                <motion.div
                  key={row.algoledger}
                  variants={ROW_VARIANTS_RIGHT}
                  className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/[0.06]"
                >
                  <CheckMark />
                  {row.algoledger}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
