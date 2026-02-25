'use client'

import { useState, useRef, useEffect } from 'react'
import { useSlideStore } from '@/store/slide-store'
import { EditorPanel } from '@/components/EditorPanel'
import { PreviewPanel } from '@/components/PreviewPanel'
import { exportToPDF, exportToHTML } from '@/lib/exportHelper'
import { showToast } from '@/components/Toast'

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

  const handlePresent = () => {
    const revealContainer = document.querySelector('.reveal')
    if (revealContainer) {
      revealContainer.requestFullscreen().catch(() => {
        showToast.error('전체화면을 지원하지 않는 브라우저입니다.')
      })
    }
  }

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
          <ExportDropdown />
          <button
            onClick={handlePresent}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
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

function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { selectedTheme, markdown } = useSlideStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExportPDF = async () => {
    try {
      setIsOpen(false)
      showToast.success('PDF 생성 중...')
      await exportToPDF({ format: 'pdf', includeNotes: false, theme: selectedTheme }, markdown)
    } catch (e) {
      showToast.error(`PDF 내보내기에 실패했습니다. ${e instanceof Error ? e.message : ''}`)
    }
  }

  const handleExportHTML = () => {
    try {
      exportToHTML({ format: 'html', includeNotes: false, theme: selectedTheme }, markdown, 'presentation.html')
    } catch {
      showToast.error('HTML 내보내기에 실패했습니다.')
    }
    setIsOpen(false)
  }

  const handleExportPptx = async () => {
    try {
      const revealContainer = document.querySelector('.reveal') as HTMLElement
      if (!revealContainer) {
        showToast.error('슬라이드 프리뷰를 찾을 수 없습니다.')
        return
      }
      const { exportToPptx } = await import('@/lib/export/pptxExporter')
      await exportToPptx(revealContainer, { theme: selectedTheme, includeNotes: false })
      showToast.success('PPTX 내보내기 완료!')
    } catch (e) {
      showToast.error(`PPTX 내보내기에 실패했습니다. ${e instanceof Error ? e.message : ''}`)
    }
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">ios_share</span>
        Export
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <DropdownItem icon="picture_as_pdf" label="Export PDF" onClick={handleExportPDF} />
          <DropdownItem icon="code" label="Export HTML" onClick={handleExportHTML} />
          <DropdownItem icon="slideshow" label="Export PPTX" onClick={handleExportPptx} />
        </div>
      )}
    </div>
  )
}

function DropdownItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <span className="material-symbols-outlined text-[18px] text-gray-500">{icon}</span>
      {label}
    </button>
  )
}
