'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSlideStore } from '@/store/slide-store'

/**
 * SlidePreview 컴포넌트
 *
 * React 내에서 직접 reveal.js 사용 (iframe 제거)
 */
export function SlidePreview() {
  const { slides, selectedTheme } = useSlideStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const initializingRef = useRef(false)

  // reveal.js 초기화 (한 번만)
  useEffect(() => {
    if (initializingRef.current) return
    if (typeof window === 'undefined') return

    initializingRef.current = true

    const initReveal = async () => {
      const Reveal = (await import('reveal.js')).default

      if (!containerRef.current) return

      const revealInstance = new Reveal(containerRef.current, {
        embedded: true,
        controls: true,
        progress: true,
        center: true,
        transition: 'slide',
        slideNumber: true,
        width: 960,
        height: 700,
      })

      // Reveal 'ready' 이벤트 리스너 등록
      revealInstance.on('ready', () => {
        console.log('✅ Reveal.js ready event fired')
        setIsReady(true)
      })

      await revealInstance.initialize()
      revealRef.current = revealInstance

      console.log('✅ Reveal.js initialized')
    }

    initReveal()

    return () => {
      if (revealRef.current) {
        revealRef.current.destroy()
        revealRef.current = null
        initializingRef.current = false
      }
    }
  }, [])

  // 슬라이드 업데이트 (reveal.js가 준비되면 실행)
  useEffect(() => {
    if (!isReady || !revealRef.current) {
      console.log('⏳ Waiting for reveal.js to be ready...')
      return
    }

    console.log('🔄 Updating slides, count:', slides.length)
    const slidesHTML = generateSlidesHTML(slides)
    const slidesContainer = containerRef.current?.querySelector('.slides')

    if (slidesContainer) {
      console.log('📝 Generated HTML length:', slidesHTML.length)
      slidesContainer.innerHTML = slidesHTML

      // Reveal.js API 직접 호출 (이벤트 기반)
      revealRef.current.sync()
      revealRef.current.slide(0, 0)
      console.log('✅ Slides updated successfully')
    } else {
      console.error('❌ Slides container not found')
    }
  }, [slides, isReady])

  // 테마 업데이트
  useEffect(() => {
    if (!isReady) return

    const themeLink = document.getElementById('reveal-theme-link') as HTMLLinkElement
    if (themeLink) {
      themeLink.href = `/reveal.js/dist/theme/${selectedTheme}.css`
      console.log('🎨 Theme changed to:', selectedTheme)
    }
  }, [selectedTheme, isReady])

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* reveal.js 컨테이너 */}
      <div ref={containerRef} className="reveal-container">
        <div className="reveal">
          <div className="slides">
            <section>
              <h1>Loading...</h1>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// 슬라이드 HTML 생성
function generateSlidesHTML(slides: any[]): string {
  if (!slides || slides.length === 0) {
    return '<section><h1>No slides yet</h1><p>Start typing in the editor!</p></section>'
  }

  const sections: Record<string, any[]> = {}

  slides.forEach(slide => {
    const sectionId = slide.sectionId || 'default'
    if (!sections[sectionId]) {
      sections[sectionId] = []
    }
    sections[sectionId].push(slide)
  })

  return Object.values(sections)
    .map(sectionSlides => {
      if (sectionSlides.length === 1) {
        return `<section>${sectionSlides[0].html}</section>`
      } else {
        return `<section>\n${sectionSlides.map(s => `  <section>${s.html}</section>`).join('\n')}\n</section>`
      }
    })
    .join('\n')
}
