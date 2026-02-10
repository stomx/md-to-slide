'use client'

import { useSlideStore } from '@/store/slide-store'

/**
 * ThumbnailStrip - 우측 가장자리 썸네일 스트립
 *
 * 슬라이드 목록을 미니 썸네일로 표시하고
 * 클릭 시 해당 슬라이드로 이동
 */
export function ThumbnailStrip() {
  const { slides, currentSlideIndex, setCurrentSlideIndex } = useSlideStore()

  return (
    <div className="absolute top-0 right-0 bottom-16 w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-3 overflow-y-auto z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] scrollbar-hide">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => setCurrentSlideIndex(index)}
          className={`
            ${
              index === currentSlideIndex
                ? 'w-12 border-2 border-primary shadow-md scale-110 bg-white'
                : 'w-10 border border-gray-200 bg-gray-100 opacity-60 hover:opacity-100 hover:ring-2 hover:ring-primary/50'
            }
            aspect-video rounded cursor-pointer transition-all relative
          `}
        >
          <div
            className={`absolute top-0 left-0 text-white text-[8px] font-bold px-1 rounded-br ${
              index === currentSlideIndex ? 'bg-primary' : 'bg-gray-500'
            }`}
          >
            {index + 1}
          </div>
        </button>
      ))}

      {/* Add New Slide */}
      <button className="size-8 mt-2 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors">
        <span className="material-symbols-outlined text-lg">add</span>
      </button>
    </div>
  )
}
