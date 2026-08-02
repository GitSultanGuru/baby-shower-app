import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import {
  Cormorant_Garamond,
  Jost,
  Great_Vibes,
  Dancing_Script,
  Tiro_Telugu,
} from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-script-alt',
  display: 'swap',
})

const tiroTelugu = Tiro_Telugu({
  subsets: ['telugu', 'latin'],
  weight: ['400'],
  variable: '--font-telugu',
  display: 'swap',
})

const SITE_TITLE = "Monica's Seemantham"
const SITE_DESC =
  "With joyful hearts, Monica along with the Uchala family warmly invites you to her Baby Shower — Seemantham on Friday, Aug 14th, 7:00 PM at ANTERA Banquet Hall, Miyapur. Tap to open, guess boy or girl, and RSVP."

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    title: SITE_TITLE,
    description: SITE_DESC,
    siteName: SITE_TITLE,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#294a2c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${greatVibes.variable} ${dancingScript.variable} ${tiroTelugu.variable} bg-forest-deep`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
