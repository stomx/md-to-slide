'use client'

import { MarkdownEditor } from '@/components/MarkdownEditor'
import { SlidePreview } from '@/components/SlidePreview'
import { ThemeSelector } from '@/components/ThemeSelector'
import { ExportButtons } from '@/components/ExportButtons'
import { Presentation } from 'lucide-react'

/**
 * Home Page
 *
 * 2단 레이아웃:
 * - 좌측: Markdown Editor
 * - 우측: Slide Preview
 * - 상단: Theme Selector + Export Buttons
 */
export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Presentation className="h-8 w-8 text-gray-900" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">md-to-slide</h1>
              <p className="text-sm text-gray-600">Markdown to Slides Converter</p>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <ThemeSelector />
            <ExportButtons />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Markdown Editor */}
        <div className="w-1/2 border-r border-gray-200 bg-white">
          <MarkdownEditor />
        </div>

        {/* Right: Slide Preview */}
        <div className="w-1/2">
          <SlidePreview />
        </div>
      </main>
    </div>
  )
}
