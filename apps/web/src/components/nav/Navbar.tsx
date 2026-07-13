'use client'

import { useState } from 'react'
import { LogoMark } from '../LogoMark'
import { NavOverlay } from './NavOverlay'
import { TypewriterWordmark } from './TypewriterWordmark'

function HamburgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex w-full items-center justify-between p-3 sm:p-5">
        <a href="#home" className="flex items-center gap-3">
          <LogoMark size={80} />
          <TypewriterWordmark className="hidden sm:inline-flex" />
        </a>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-600 bg-black px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800 active:scale-[0.97] sm:text-sm"
        >
          {isOpen ? 'Close' : 'Menu'}
          {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      <NavOverlay open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
