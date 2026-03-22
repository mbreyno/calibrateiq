import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'CalibrateIQ — Risk Tolerance Intelligence for Financial Advisors',
    template: '%s | CalibrateIQ',
  },
  description:
    'CalibrateIQ helps financial advisors send branded risk tolerance questionnaires to clients, build accurate risk profiles, and generate professional Investment Policy Statements in minutes.',
  openGraph: {
    title: 'CalibrateIQ',
    description: 'Risk tolerance intelligence for financial advisors.',
    type: 'website',
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
