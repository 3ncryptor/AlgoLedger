import { cn } from '@algoledger/ui'
import { DashboardIcon, KnowledgeGraphIcon, SettingsIcon } from '../components/icons/icons'

export type PopupPage = 'dashboard' | 'knowledge'

interface NavbarProps {
  page: PopupPage
  onNavigate: (page: PopupPage) => void
}

const NAV_ITEMS: { page: PopupPage; label: string; Icon: typeof DashboardIcon }[] = [
  { page: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { page: 'knowledge', label: 'Knowledge Graph', Icon: KnowledgeGraphIcon },
]

export function Navbar({ page, onNavigate }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between border-b border-border px-2">
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ page: itemPage, label, Icon }) => {
          const isActive = page === itemPage

          return (
            <button
              key={itemPage}
              type="button"
              onClick={() => onNavigate(itemPage)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors active:translate-y-px',
                isActive
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        title="Settings"
        onClick={() => chrome.runtime.openOptionsPage()}
        className="p-2 text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
      >
        <SettingsIcon className="size-4" />
      </button>
    </nav>
  )
}
