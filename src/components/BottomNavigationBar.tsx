'use client'

import { useSlideStore } from '@/store/slide-store'

/**
 * BottomNavigationBar - 하단 네비게이션 바
 *
 * 뷰 토글 + 슬라이드 네비게이터 + 줌 컨트롤
 */
export function BottomNavigationBar() {
  const { slides, currentSlideIndex, setCurrentSlideIndex, viewMode, setViewMode } = useSlideStore()

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 shadow-sm z-20 shrink-0">
      {/* 좌측: 뷰 토글 */}
      <div className="flex items-center gap-2">
        <ViewToggleButton
          icon="grid_view"
          active={viewMode === 'grid'}
          onClick={() => setViewMode('grid')}
        />
        <ViewToggleButton
          icon="view_sidebar"
          active={viewMode === 'filmstrip'}
          onClick={() => setViewMode('filmstrip')}
        />
      </div>

      {/* 중앙: 슬라이드 네비게이터 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
          disabled={currentSlideIndex === 0}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-sm font-bold text-gray-900">
          Slide {currentSlideIndex + 1}{' '}
          <span className="text-gray-400 font-normal">of {slides.length}</span>
        </span>
        <button
          onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
          disabled={currentSlideIndex >= slides.length - 1}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {/* 우측: 줌 */}
      <div className="flex items-center gap-3 w-[100px] justify-end">
        <button className="text-gray-500 hover:text-gray-900 text-xs font-medium uppercase tracking-wide">
          Fit
        </button>
      </div>
    </div>
  )
}

function ViewToggleButton({
  icon,
  active,
  onClick,
}: {
  icon: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}
