import { RepoConnectedIcon } from '../components/icons/icons'

interface RepoBadgeProps {
  repoOwner: string
  repoName: string
}

export function RepoBadge({ repoOwner, repoName }: RepoBadgeProps) {
  return (
    <button
      type="button"
      title={`${repoOwner}/${repoName}`}
      onClick={() => chrome.tabs.create({ url: `https://github.com/${repoOwner}/${repoName}` })}
      className="flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-1 text-foreground transition-colors hover:bg-muted active:translate-y-px"
    >
      <RepoConnectedIcon className="size-3.5" />
      <span className="text-[0.65rem] font-medium">Connected</span>
    </button>
  )
}
