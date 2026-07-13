import { RepoBadge } from './RepoBadge'

interface TopBarProps {
  repoOwner: string
  repoName: string
}

const APP_ICON_URL = chrome.runtime.getURL('src/assets/icons/icon-32.png')

export function TopBar({ repoOwner, repoName }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-md bg-foreground/10">
          <img src={APP_ICON_URL} alt="" className="size-4" />
        </div>
        <span className="text-sm font-semibold">AlgoLedger</span>
      </div>
      <RepoBadge repoOwner={repoOwner} repoName={repoName} />
    </div>
  )
}
