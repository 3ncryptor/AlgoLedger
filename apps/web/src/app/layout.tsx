import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AlgoLedger',
  description:
    'Automatically converts accepted competitive programming submissions into a structured, version-controlled GitHub knowledge repository.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
