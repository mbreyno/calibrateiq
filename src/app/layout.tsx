import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'CalibrateIQ — Simple Risk Profile & IPS for Financial Advisors',
    template: '%s | CalibrateIQ',
  },
  description:
    'Send branded risk surveys to clients, automatically score their Risk Capacity and Risk Preference, and generate a professional Investment Policy Statement — ready to export as a PDF in minutes.',
  metadataBase: new URL('https://calibrateiq.netlify.app'),
  openGraph: {
    title: 'CalibrateIQ — Simple Risk Profile & IPS',
    description:
      'Send branded risk surveys to clients, score their Risk Capacity and Risk Preference, and generate a professional IPS — ready to export as a PDF in minutes.',
    url: 'https://calibrateiq.netlify.app',
    siteName: 'CalibrateIQ',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalibrateIQ — Simple Risk Profile & IPS',
    description:
      'Send branded risk surveys to clients, score their Risk Capacity and Risk Preference, and generate a professional IPS — ready to export as a PDF in minutes.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
