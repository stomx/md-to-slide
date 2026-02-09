'use client'

import { Presentation, Sparkles } from 'lucide-react'

import { MarkdownEditor } from '@/components/MarkdownEditor'
import { SlidePreview } from '@/components/SlidePreview'
import { ThemeSelector } from '@/components/ThemeSelector'
import { ExportButtons } from '@/components/ExportButtons'
import { ResponsiveLayout } from '@/components/ResponsiveLayout'
import { AIWizardPanel } from '@/components/ai-wizard/AIWizardPanel'
import { useSlideStore } from '@/store/slide-store'
import { useAIWizardStore } from '@/store/ai-wizard-store'
import { Button } from '@/components/ui/Button'

/**
 * Home Page
 *
 * 2단 레이아웃:
 * - 좌측: Markdown Editor
 * - 우측: Slide Preview
 * - 상단: Theme Selector + Export Buttons
 * - 하단: Footer (슬라이드 수, 테마, 상태)
 */
export default function Home() {
  const { slides, selectedTheme, isDirty } = useSlideStore()
  const { isOpen, openWizard } = useAIWizardStore()

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
            <Button
              variant={isOpen ? 'default' : 'outline'}
              size="sm"
              onClick={openWizard}
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              AI 생성
            </Button>
            <ThemeSelector />
            <ExportButtons />
          </div>
        </div>
      </header>

      {/* Main Content - ResponsiveLayout handles Desktop/Tablet/Mobile */}
      <main className="flex-1 overflow-hidden">
        <ResponsiveLayout>
          <MarkdownEditor />
          <SlidePreview />
          <AIWizardPanel />
        </ResponsiveLayout>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Slides: {slides.length}</span>
          <span>Theme: {selectedTheme}</span>
          <span>{isDirty ? 'Unsaved changes' : 'Saved'}</span>
        </div>
      </footer>
    </div>
  )
}
