import { marked } from 'marked'
import DOMPurify from 'dompurify'

import { HORIZONTAL_SEPARATOR, VERTICAL_SEPARATOR, NOTES_SEPARATOR } from '@/constants/separators'
import type { Slide, SlideMetadata } from '@/types/slide.types'

/**
 * @deprecated reveal.js Markdown 플러그인으로 대체됨.
 * 하위 호환성을 위해 유지. 새 코드에서는 사용하지 마세요.
 *
 * Markdown을 Slide 배열로 파싱
 */
export function parseMarkdownToSlides(markdown: string): Slide[] {
  const slides: Slide[] = []
  let globalOrder = 0

  const horizontalSections = markdown.split(HORIZONTAL_SEPARATOR)

  horizontalSections.forEach((section, hIndex) => {
    const verticalSlides = section.split(VERTICAL_SEPARATOR)

    verticalSlides.forEach((content, vIndex) => {
      const trimmedContent = content.trim()
      if (!trimmedContent) return

      const rawHtml = marked(trimmedContent) as string
      const html = typeof window !== 'undefined'
        ? DOMPurify.sanitize(rawHtml)
        : rawHtml

      slides.push({
        id: `slide-${hIndex}-${vIndex}`,
        content: trimmedContent,
        html,
        order: globalOrder++,
        type: vIndex === 0 ? 'horizontal' : 'vertical',
        sectionId: `section-${hIndex}`,
      })
    })
  })

  return slides
}

/**
 * @deprecated reveal.js Markdown 플러그인으로 대체됨.
 * 하위 호환성을 위해 유지. 새 코드에서는 사용하지 마세요.
 *
 * Slide 배열을 reveal.js HTML 구조로 변환
 */
export function slidesToRevealHTML(slides: Slide[]): string {
  if (slides.length === 0) {
    return '<section><h1>No slides yet</h1><p>Start typing in the editor!</p></section>'
  }

  const sections: Record<string, Slide[]> = {}

  slides.forEach((slide) => {
    const sectionId = slide.sectionId || 'default'
    if (!sections[sectionId]) {
      sections[sectionId] = []
    }
    sections[sectionId].push(slide)
  })

  return Object.values(sections)
    .map((sectionSlides) => {
      if (sectionSlides.length === 1) {
        return `<section>${sectionSlides[0].html}</section>`
      } else {
        return `<section>
${sectionSlides.map((slide) => `  <section>${slide.html}</section>`).join('\n')}
</section>`
      }
    })
    .join('\n')
}

/**
 * 마크다운에서 수평 슬라이드 수를 카운팅
 *
 * @param markdown - 원본 마크다운 텍스트
 * @returns 수평 슬라이드 수
 */
export function countSlides(markdown: string): number {
  return markdown.split(HORIZONTAL_SEPARATOR).length
}

/**
 * 각 슬라이드의 메타데이터를 추출
 *
 * Footer 슬라이드 수 표시, 아웃라인 뷰 등에 사용
 *
 * @param markdown - 원본 마크다운 텍스트
 * @returns 슬라이드 메타데이터 배열
 */
export function extractSlideMetadata(markdown: string): SlideMetadata[] {
  const horizontalSections = markdown.split(HORIZONTAL_SEPARATOR)

  return horizontalSections.map((section, index) => {
    const trimmed = section.trim()

    // 제목 추출: 첫 번째 # 헤딩
    const titleMatch = trimmed.match(/^#+\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : null

    // 노트 유무 확인
    const hasNotes = NOTES_SEPARATOR.test(trimmed)

    // 배경색 추출: <!-- .slide: data-background-color="#xxx" -->
    const bgMatch = trimmed.match(/<!--\s*\.slide:.*data-background-color="([^"]+)"/)
    const background = bgMatch ? bgMatch[1] : null

    return { index, title, hasNotes, background }
  })
}
