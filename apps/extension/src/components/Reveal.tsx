import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: HOUSE_EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
