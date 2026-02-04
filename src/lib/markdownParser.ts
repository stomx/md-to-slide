import { marked } from 'marked'
import type { Slide } from '@/types/slide.types'
import { HORIZONTAL_SEPARATOR, VERTICAL_SEPARATOR } from '@/constants/separators'

/**
 * Markdown을 Slide 배열로 파싱
 *
 * 알고리즘:
 * 1. `---`로 수평 섹션 분리
 * 2. 각 섹션을 `-----`로 수직 슬라이드 분리
 * 3. 각 슬라이드 마크다운을 HTML로 변환
 *
 * 시간 복잡도: O(n) - n은 마크다운 길이
 *
 * @param markdown - 원본 마크다운 텍스트
 * @returns 파싱된 Slide 배열
 *
 * @example
 * const markdown = '# Slide 1\n---\n# Slide 2'
 * const slides = parseMarkdownToSlides(markdown)
 * // => [
 * //   { id: 'slide-0-0', content: '# Slide 1', ... },
 * //   { id: 'slide-1-0', content: '# Slide 2', ... }
 * // ]
 */
export function parseMarkdownToSlides(markdown: string): Slide[] {
  const slides: Slide[] = []
  let globalOrder = 0

  // 1단계: 수평 섹션 분리 (---)
  const horizontalSections = markdown.split(HORIZONTAL_SEPARATOR)

  horizontalSections.forEach((section, hIndex) => {
    // 2단계: 수직 슬라이드 분리 (-----)
    const verticalSlides = section.split(VERTICAL_SEPARATOR)

    verticalSlides.forEach((content, vIndex) => {
      const trimmedContent = content.trim()

      // 빈 슬라이드 건너뛰기
      if (!trimmedContent) return

      // 3단계: 마크다운 → HTML 변환
      const html = marked(trimmedContent) as string

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
 * Slide 배열을 reveal.js HTML 구조로 변환
 *
 * 클라이언트 사이드 렌더링용: 이미 파싱된 HTML을 직접 사용
 *
 * @param slides - Slide 배열
 * @returns reveal.js <div class="slides"> 내부 HTML
 */
export function slidesToRevealHTML(slides: Slide[]): string {
  if (slides.length === 0) {
    return '<section><h1>No slides yet</h1><p>Start typing in the editor!</p></section>'
  }

  const sections: Record<string, Slide[]> = {}

  // 섹션별로 그룹화
  slides.forEach((slide) => {
    const sectionId = slide.sectionId || 'default'
    if (!sections[sectionId]) {
      sections[sectionId] = []
    }
    sections[sectionId].push(slide)
  })

  // HTML 생성 (이미 파싱된 HTML 사용)
  return Object.values(sections)
    .map((sectionSlides) => {
      if (sectionSlides.length === 1) {
        // 단일 슬라이드 (수평만)
        return `<section>${sectionSlides[0].html}</section>`
      } else {
        // 중첩 슬라이드 (수평 + 수직)
        return `<section>
${sectionSlides.map((slide) => `  <section>${slide.html}</section>`).join('\n')}
</section>`
      }
    })
    .join('\n')
}
