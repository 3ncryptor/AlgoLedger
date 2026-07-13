'use client'

import { motion } from 'framer-motion'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

interface Fact {
  value: string
  label: string
}

const FACTS: Fact[] = [
  { value: '1 commit', label: '= 1 accepted submission' },
  { value: 'Zero backend', label: 'GitHub is the database' },
  { value: '100% yours', label: 'a plain git repo, forever' },
]

export function MechanismStrip() {
  return (
    <section className="border-y border-white/10 bg-black py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-white/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {FACTS.map((fact, index) => (
          <motion.div
            key={fact.value}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.4, ease: HOUSE_EASE, delay: index * 0.08 }}
            className="flex flex-col items-center gap-1 py-6 text-center sm:py-0"
          >
            <span className="text-xl font-bold text-white sm:text-2xl">{fact.value}</span>
            <span className="text-xs text-white/50 sm:text-sm">{fact.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
