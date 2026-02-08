'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSlideStore } from '@/store/slide-store'
import { slidesToRevealHTML } from '@/lib/markdownParser'
import { REVEAL_CONFIG } from '@/constants/defaults'

/**
 * SlidePreview 컴포넌트
 *
 * React 내에서 직접 reveal.js 사용 (iframe 제거)
 */
export function SlidePreview() {
  const { slides, selectedTheme } = useSlideStore()
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        ...REVEAL_CONFIG,
        embedded: true,
        hash: false,
        width: 960,
        height: 700,
      })

      // Reveal 'ready' 이벤트 리스너 등록
      revealInstance.on('ready', () => {
        setIsReady(true)
      })

      await revealInstance.initialize()
      revealRef.current = revealInstance
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
    if (!isReady || !revealRef.current) return

    const slidesHTML = slidesToRevealHTML(slides)
    const slidesContainer = containerRef.current?.querySelector('.slides')

    if (slidesContainer) {
      slidesContainer.innerHTML = slidesHTML

      // Reveal.js API 직접 호출 (이벤트 기반)
      revealRef.current.sync()
      revealRef.current.slide(0, 0)
    }
  }, [slides, isReady])

  // 테마 업데이트
  useEffect(() => {
    if (!isReady) return

    const themeLink = document.getElementById('reveal-theme-link') as HTMLLinkElement
    if (themeLink) {
      themeLink.href = `/reveal.js/dist/theme/${selectedTheme}.css`
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
