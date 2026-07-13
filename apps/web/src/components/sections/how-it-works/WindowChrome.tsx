function TrafficLights() {
  return (
    <div className="flex gap-1.5">
      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
      <span className="size-2.5 rounded-full bg-[#febc2e]" />
      <span className="size-2.5 rounded-full bg-[#28c840]" />
    </div>
  )
}

interface WindowChromeProps {
  title: string
  children: React.ReactNode
}

/** A macOS-style terminal window title bar (traffic lights + centered app title). */
export function WindowChrome({ title, children }: WindowChromeProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[#0d0d0d]">
      <div className="relative flex items-center border-b border-white/10 bg-[#1a1a1a] px-3 py-2.5">
        <TrafficLights />
        <span className="absolute inset-x-0 text-center text-xs text-white/40">{title}</span>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}

interface BrowserChromeProps {
  url: string
  children: React.ReactNode
}

/** A Chrome-style browser window (traffic lights + a real address bar), so each scene reads as
 * "this is what's actually on screen" rather than a floating UI card. */
export function BrowserChrome({ url, children }: BrowserChromeProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[#0d0d0d]">
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#1a1a1a] px-3 py-2.5">
        <TrafficLights />
        <div className="flex flex-1 items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-xs text-white/50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3 shrink-0 text-white/30"
            aria-hidden="true"
          >
            <rect x={5} y={11} width={14} height={9} rx={1.5} />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span className="truncate">{url}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
