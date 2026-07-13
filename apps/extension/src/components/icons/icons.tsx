import {
  DASHBOARD_ELEMENTS,
  EXTERNAL_LINK_ELEMENTS,
  KNOWLEDGE_GRAPH_ELEMENTS,
  REPO_CONNECTED_ELEMENTS,
  SETTINGS_ELEMENTS,
} from './icon-defs'
import { RetracingSvg } from './RetracingSvg'

interface IconProps {
  className?: string
}

export function DashboardIcon({ className }: IconProps) {
  return <RetracingSvg elements={DASHBOARD_ELEMENTS} trigger="hover" className={className} />
}

export function KnowledgeGraphIcon({ className }: IconProps) {
  return (
    <RetracingSvg
      elements={KNOWLEDGE_GRAPH_ELEMENTS}
      trigger="hover"
      choreography={{ staggerStep: 0.08 }}
      className={className}
    />
  )
}

export function RepoConnectedIcon({ className }: IconProps) {
  return <RetracingSvg elements={REPO_CONNECTED_ELEMENTS} trigger="hover" className={className} />
}

export function ExternalLinkIcon({ className }: IconProps) {
  return <RetracingSvg elements={EXTERNAL_LINK_ELEMENTS} trigger="hover" className={className} />
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <RetracingSvg
      elements={SETTINGS_ELEMENTS}
      trigger="hover"
      choreography={{ staggerStep: 0.04 }}
      className={className}
    />
  )
}
