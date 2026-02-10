'use client'

import { useSlideStore } from '@/store/slide-store'

export function ModeSwitcher() {
  const { editorMode, setEditorMode } = useSlideStore()

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="bg-sidebar-darker p-1 rounded-lg flex items-center justify-center">
        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            name="editor-mode"
            value="markdown"
            checked={editorMode === 'markdown'}
            onChange={() => setEditorMode('markdown')}
            className="peer sr-only"
          />
          <div className="flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-all peer-checked:bg-gray-700 peer-checked:text-white peer-checked:shadow-sm text-gray-400 hover:text-gray-200">
            <span className="material-symbols-outlined text-[18px] mr-2">code</span>
            Markdown
          </div>
        </label>
        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            name="editor-mode"
            value="ai"
            checked={editorMode === 'ai'}
            onChange={() => setEditorMode('ai')}
            className="peer sr-only"
          />
          <div className="flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-sm text-gray-400 hover:text-gray-200">
            <span className="material-symbols-outlined text-[18px] mr-2">auto_awesome</span>
            AI Assistant
          </div>
        </label>
      </div>
    </div>
  )
}
