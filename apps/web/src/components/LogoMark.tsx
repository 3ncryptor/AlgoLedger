import Image from 'next/image'

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 40 }: LogoMarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center ${className ?? ''}`}
      style={{ height: size }}
    >
      <Image
        src="/logo1.png"
        alt="AlgoLedger"
        width={500}
        height={500}
        className="h-full w-auto object-contain"
        priority
      />
    </span>
  )
}
