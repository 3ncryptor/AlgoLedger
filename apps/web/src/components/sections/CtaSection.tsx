'use client'

import { motion } from 'framer-motion'
import { ArrowRightIcon, GithubIcon } from '../icons/icons'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

export function CtaSection() {
  return (
    <section className="relative bg-[#0a0a0a] py-24 text-center sm:py-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: HOUSE_EASE }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Start archiving today
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: HOUSE_EASE, delay: 0.08 }}
          className="mx-auto mt-4 max-w-md text-sm text-white/55"
        >
          Two minutes to connect. Every solve after that is automatic.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: HOUSE_EASE, delay: 0.16 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="https://github.com/3ncryptor/AlgoLedger"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform active:scale-[0.97]"
          >
            Clone &amp; load the extension
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="https://github.com/3ncryptor/AlgoLedger"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 active:scale-[0.97]"
          >
            <GithubIcon className="size-4" />
            Star &amp; contribute
          </a>
        </motion.div>
      </div>
    </section>
  )
}
