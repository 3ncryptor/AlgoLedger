import type { Metadata } from 'next'
import './globals.css'

const DESCRIPTION =
  'Automatically converts accepted competitive programming submissions into a structured, version-controlled GitHub knowledge repository.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'AlgoLedger',
  description: DESCRIPTION,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'AlgoLedger',
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1254, height: 1254, alt: 'AlgoLedger' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoLedger',
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
