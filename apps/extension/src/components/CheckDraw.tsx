import { motion } from 'framer-motion'

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

interface CheckDrawProps {
  className?: string
}

export function CheckDraw({ className }: CheckDrawProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <motion.path
        d="M4 12.5L9.5 18L20 6"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: HOUSE_EASE }}
      />
    </svg>
  )
}
