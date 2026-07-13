interface LaptopProps {
  children: React.ReactNode
}

/** A realistic laptop bezel — every "How It Works" scene renders inside this one persistent
 * frame as an OS window (terminal/browser), like a Figma prototype's device frame, instead of
 * each scene being its own floating card. */
export function Laptop({ children }: LaptopProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="relative w-full rounded-t-2xl rounded-b-md border-[10px] border-[#1c1c1e] bg-[#1c1c1e] p-1.5 shadow-[0_50px_100px_rgba(0,0,0,0.65)]">
        <div className="absolute top-0 left-1/2 z-10 h-3 w-16 -translate-x-1/2 rounded-b-lg bg-[#1c1c1e]" />
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-md bg-black">
          {children}
        </div>
      </div>
      <div className="h-3 w-full rounded-b-2xl bg-linear-to-b from-[#3a3a3c] to-[#161618]" />
      <div className="h-1.5 w-2/3 rounded-b-xl bg-[#0d0d0e]" />
    </div>
  )
}
