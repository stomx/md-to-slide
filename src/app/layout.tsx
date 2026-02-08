import type { Metadata } from 'next'

import { ToastProvider } from '@/components/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'md-to-slide - Markdown to Slides',
  description: 'Convert Markdown to beautiful reveal.js presentations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/reveal.js/dist/reveal.css" />
        <link id="reveal-theme-link" rel="stylesheet" href="/reveal.js/dist/theme/black.css" />
        <link rel="stylesheet" href="/reveal.js/plugin/highlight/monokai.css" />
      </head>
      <body className="antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
