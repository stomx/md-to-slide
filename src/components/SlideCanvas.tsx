'use client'

import { SlidePreview } from './SlidePreview'

/**
 * SlideCanvas - 도트 패턴 배경 + 카드형 슬라이드 래퍼
 *
 * reveal.js를 aspect-video 카드 안에 렌더링
 */
export function SlideCanvas() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16 overflow-hidden group/canvas dot-pattern-bg">
      {/* 카드형 슬라이드 */}
      <div className="aspect-video w-full max-w-5xl bg-white shadow-2xl rounded-xl overflow-hidden relative">
        <SlidePreview />
      </div>
    </div>
  )
}
