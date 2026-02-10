'use client'

import { useSlideStore } from '@/store/slide-store'
import { EditorPanel } from '@/components/EditorPanel'
import { PreviewPanel } from '@/components/PreviewPanel'

/**
 * Home Page - SlideCraft
 *
 * Slide-First Hybrid Workspace:
 * - 헤더: 로고 + 문서 제목 + 액션 버튼
 * - 좌측 30%: EditorPanel (다크 사이드바)
 * - 우측 70%: PreviewPanel (밝은 프리뷰)
 */
export default function Home() {
  const { documentTitle, setDocumentTitle } = useSlideStore()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light font-display text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shrink-0 z-20">
        {/* 좌측: 로고 */}
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl text-primary">slideshow</span>
          <h2 className="text-lg font-bold tracking-tight">SlideCraft</h2>
        </div>

        {/* 중앙: 문서 제목 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="bg-transparent text-center text-sm font-medium text-gray-700 border-none outline-none focus:ring-0 hover:bg-gray-100 focus:bg-gray-100 px-3 py-1 rounded-md transition-colors"
            aria-label="Document title"
          />
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>

        {/* 우측: 액션 */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Present
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white ml-2">
            U
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Editor Panel (30%) */}
        <EditorPanel />

        {/* Right: Preview Panel (70%) */}
        <PreviewPanel />
      </main>
    </div>
  )
}
