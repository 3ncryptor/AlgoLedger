import { RetracingSvg } from '@algoledger/ui'
import {
  ARROW_RIGHT_ELEMENTS,
  BRANCH_ELEMENTS,
  GITHUB_ELEMENTS,
  GRID_ELEMENTS,
  LOCK_ELEMENTS,
  MAIL_ELEMENTS,
  PULSE_ELEMENTS,
  TERMINAL_ELEMENTS,
  ZAP_ELEMENTS,
} from './icon-defs'

interface IconProps {
  className?: string
}

export function GithubIcon({ className }: IconProps) {
  return <RetracingSvg elements={GITHUB_ELEMENTS} trigger="hover" className={className} />
}

export function MailIcon({ className }: IconProps) {
  return <RetracingSvg elements={MAIL_ELEMENTS} trigger="hover" className={className} />
}

export function ArrowRightIcon({ className }: IconProps) {
  return <RetracingSvg elements={ARROW_RIGHT_ELEMENTS} trigger="hover" className={className} />
}

export function BranchIcon({ className }: IconProps) {
  return (
    <RetracingSvg
      elements={BRANCH_ELEMENTS}
      trigger="hover"
      choreography={{ staggerStep: 0.07 }}
      className={className}
    />
  )
}

export function TerminalIcon({ className }: IconProps) {
  return <RetracingSvg elements={TERMINAL_ELEMENTS} trigger="hover" className={className} />
}

export function GridIcon({ className }: IconProps) {
  return <RetracingSvg elements={GRID_ELEMENTS} trigger="hover" className={className} />
}

export function PulseIcon({ className }: IconProps) {
  return <RetracingSvg elements={PULSE_ELEMENTS} trigger="hover" className={className} />
}

export function LockIcon({ className }: IconProps) {
  return <RetracingSvg elements={LOCK_ELEMENTS} trigger="hover" className={className} />
}

export function ZapIcon({ className }: IconProps) {
  return <RetracingSvg elements={ZAP_ELEMENTS} trigger="hover" className={className} />
}
