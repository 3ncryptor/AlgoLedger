'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { GithubMarkIcon, LinkedinIcon, XIcon } from '../icons/BrandIcons'
import { MailIcon } from '../icons/icons'

interface NavLink {
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contribute', href: '#open-source' },
  { label: 'Docs', href: 'https://github.com/3ncryptor/AlgoLedger#readme' },
]

interface NavOverlayProps {
  open: boolean
  onClose: () => void
}

const HOUSE_EASE = [0.23, 1, 0.32, 1] as const

const CONNECT_LINKS = [
  { label: 'GitHub', href: 'https://github.com/3ncryptor/AlgoLedger', Icon: GithubMarkIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aryan-vibhuti/', Icon: LinkedinIcon },
  { label: 'X', href: 'https://x.com/3ncryptor', Icon: XIcon },
]

export function NavOverlay({ open, onClose }: NavOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: HOUSE_EASE }}
          className="fixed inset-0 z-40 grid h-screen w-full grid-cols-1 overflow-y-auto bg-black md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col justify-center gap-5 p-5 sm:p-10 md:gap-8 md:p-15 lg:col-span-2 lg:p-20">
            {NAV_LINKS.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={onClose}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: HOUSE_EASE, delay: 0.05 + index * 0.06 }}
                className="w-fit text-3xl font-bold text-white transition-colors hover:text-white/70 sm:text-4xl md:text-5xl lg:text-6xl"
              >
                <span className="mr-2 text-xs text-gray-400 sm:text-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="flex h-full flex-col justify-between gap-10 border-t border-white/10 p-5 pb-10 lg:border-t-0 lg:border-l lg:p-20">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-400 sm:text-lg">Connect</p>
              <div className="flex flex-wrap gap-3">
                {CONNECT_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition-colors hover:bg-white/10 active:scale-[0.97]"
                  >
                    <Icon className="size-5" />
                  </a>
                ))}
                <a
                  href="mailto:aryanvibhuti@gmail.com"
                  aria-label="Email"
                  className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition-colors hover:bg-white/10 active:scale-[0.97]"
                >
                  <MailIcon className="size-5" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-400 sm:text-lg">Get in Touch</p>
              <a
                href="mailto:aryanvibhuti@gmail.com"
                className="w-fit break-all text-lg font-semibold text-white sm:text-2xl"
              >
                aryanvibhuti@gmail.com
              </a>
              <a
                href="https://github.com/3ncryptor/AlgoLedger"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform active:scale-[0.97]"
              >
                Star on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
