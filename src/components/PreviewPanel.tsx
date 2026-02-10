'use client'

import { SlideCanvas } from './SlideCanvas'
import { FloatingToolbar } from './FloatingToolbar'
import { BottomNavigationBar } from './BottomNavigationBar'
import { ThumbnailStrip } from './ThumbnailStrip'

/**
 * PreviewPanel - 우측 프리뷰 영역 (70%)
 *
 * FloatingToolbar + SlideCanvas + BottomNav + ThumbnailStrip
 */
export function PreviewPanel() {
  return (
    <section className="flex-1 bg-gray-100 relative flex flex-col h-full overflow-hidden group/canvas">
      {/* Floating Toolbar (hover시 표시) */}
      <FloatingToolbar />

      {/* Slide Canvas */}
      <SlideCanvas />

      {/* Bottom Navigation */}
      <BottomNavigationBar />

      {/* Thumbnail Strip (우측 가장자리) */}
      <ThumbnailStrip />
    </section>
  )
}
