'use client'

import { LogoMark } from '../LogoMark'
import { GithubMarkIcon, LinkedinIcon, XIcon } from '../icons/BrandIcons'
import { MailIcon } from '../icons/icons'
import { FooterWatermark } from './FooterWatermark'

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/3ncryptor/AlgoLedger', Icon: GithubMarkIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aryan-vibhuti/', Icon: LinkedinIcon },
  { label: 'X', href: 'https://x.com/3ncryptor', Icon: XIcon },
]

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contribute', href: '#open-source' },
]

function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:border-white/30 hover:text-white active:scale-[0.97]"
    >
      Back to top
    </button>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-75 w-150 -translate-x-1/2 rounded-full bg-linear-to-br from-white/10 via-white/5 to-transparent blur-3xl"
      />
      <FooterWatermark />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <a href="#home" className="mb-4 inline-flex items-center">
              <LogoMark size={96} />
            </a>
            <p className="text-sm leading-relaxed text-gray-400">
              Every accepted submission, permanently archived as a structured GitHub knowledge base.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Get in Touch</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:aryanvibhuti@gmail.com"
                  className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  <MailIcon className="size-4 text-zinc-500 transition-all group-hover:scale-110 group-hover:text-white" />
                  aryanvibhuti@gmail.com
                </a>
              </li>
              <li className="text-sm text-gray-400">Open source · worldwide</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Contribute</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/3ncryptor/AlgoLedger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  View on GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/3ncryptor/AlgoLedger/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Good first issues
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-all duration-300 hover:border-white/50 hover:bg-white/5 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
            <a
              href="mailto:aryanvibhuti@gmail.com"
              aria-label="Email"
              className="flex size-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-all duration-300 hover:border-white/50 hover:bg-white/5 hover:text-white"
            >
              <MailIcon className="size-4" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>&copy; {new Date().getFullYear()} AlgoLedger.</span>
            <a
              href="https://github.com/3ncryptor/AlgoLedger"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              View source
            </a>
          </div>

          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
