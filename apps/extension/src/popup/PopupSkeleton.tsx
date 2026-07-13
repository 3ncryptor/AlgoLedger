export function PopupSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-8 w-full animate-pulse rounded bg-muted" />
      <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  )
}
