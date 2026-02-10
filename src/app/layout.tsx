import type { Metadata } from 'next'

import { ToastProvider } from '@/components/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'SlideCraft - Markdown to Slides',
  description: 'Convert Markdown to beautiful reveal.js presentations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/reveal.js/dist/reveal.css" />
        <link id="reveal-theme-link" rel="stylesheet" href="/reveal.js/dist/theme/black.css" />
        <link rel="stylesheet" href="/reveal.js/plugin/highlight/monokai.css" />
      </head>
      <body className="font-display antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
