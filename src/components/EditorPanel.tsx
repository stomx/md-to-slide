'use client'

import { useSlideStore } from '@/store/slide-store'
import { ModeSwitcher } from './ModeSwitcher'
import { MarkdownEditor } from './MarkdownEditor'
import { EditorActionBar } from './EditorActionBar'
import { AIWizardPanel } from './ai-wizard/AIWizardPanel'

/**
 * EditorPanel - 좌측 다크 사이드바 (30%)
 *
 * Mode Switcher로 Markdown/AI 전환
 */
export function EditorPanel() {
  const { editorMode } = useSlideStore()

  return (
    <aside className="w-[30%] min-w-[320px] max-w-[450px] bg-sidebar-dark text-gray-300 flex flex-col border-r border-gray-800 z-10 shadow-xl">
      {/* Mode Switcher */}
      <ModeSwitcher />

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
        {editorMode === 'markdown' ? (
          <MarkdownEditor />
        ) : (
          <AIWizardPanel />
        )}
      </div>

      {/* Bottom Actions */}
      <EditorActionBar />
    </aside>
  )
}
