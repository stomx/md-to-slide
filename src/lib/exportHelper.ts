import type { ExportConfig } from '@/types/slide.types'

/**
 * PDF로 내보내기
 *
 * 오프스크린에 별도 reveal.js 인스턴스를 생성하여 원본 마크다운을 렌더링한 뒤,
 * 각 슬라이드를 순회하며 html2canvas로 캡처 → jsPDF 파일 다운로드.
 *
 * 기존 DOM의 hidden/aria-hidden 런타임 상태에 의존하지 않으므로
 * 모든 슬라이드가 정상적으로 캡처됨.
 */
export async function exportToPDF(config: ExportConfig, markdown: string): Promise<void> {
  const html2canvas = (await import('html2canvas-pro')).default
  const { jsPDF } = await import('jspdf')
  const Reveal = (await import('reveal.js')).default
  const RevealMarkdown = (await import('reveal.js/plugin/markdown/markdown.esm.js')).default

  // 오프스크린 래퍼 생성
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:960px;height:540px;overflow:hidden;'
  document.body.appendChild(wrapper)

  // reveal.js 구조 생성 (SlidePreview와 동일한 방식)
  const revealDiv = document.createElement('div')
  revealDiv.className = 'reveal'
  revealDiv.style.cssText = 'width:960px;height:540px;'

  const slidesDiv = document.createElement('div')
  slidesDiv.className = 'slides'

  const section = document.createElement('section')
  section.setAttribute('data-markdown', '')
  section.setAttribute('data-separator', '^\n---\n$')
  section.setAttribute('data-separator-vertical', '^\n--\n$')

  const script = document.createElement('script')
  script.setAttribute('type', 'text/template')
  script.textContent = markdown

  section.appendChild(script)
  slidesDiv.appendChild(section)
  revealDiv.appendChild(slidesDiv)
  wrapper.appendChild(revealDiv)

  // 테마 CSS가 이미 글로벌로 로드되어 있으므로 .reveal 요소에 자동 적용됨

  try {
    const deck = new Reveal(revealDiv, {
      width: 960,
      height: 540,
      minScale: 1,
      maxScale: 1,
      center: true,
      controls: false,
      progress: false,
      slideNumber: false,
      transition: 'none',
      plugins: [RevealMarkdown],
      embedded: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    await deck.initialize()

    // Markdown 플러그인 처리 대기
    await new Promise(r => setTimeout(r, 500))

    // reveal.js 타입 정의에 누락된 API 메서드 사용
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deckApi = deck as any
    const allSlides: HTMLElement[] = deckApi.getSlides()
    if (allSlides.length === 0) {
      throw new Error('슬라이드가 없습니다.')
    }

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [960, 540] })

    for (let i = 0; i < allSlides.length; i++) {
      // getIndices로 정확한 h, v 좌표를 얻어 네비게이션 (수직 슬라이드 포함)
      const indices = deckApi.getIndices(allSlides[i])
      deckApi.slide(indices.h, indices.v)
      await new Promise(r => setTimeout(r, 200))

      const canvas = await html2canvas(revealDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 960,
        height: 540,
        windowWidth: 960,
        windowHeight: 540,
      })

      if (i > 0) {
        pdf.addPage([960, 540], 'landscape')
      }
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 960, 540)
    }

    deckApi.destroy()
    pdf.save('presentation.pdf')
  } finally {
    document.body.removeChild(wrapper)
  }
}

/**
 * HTML로 내보내기
 *
 * DOM이 아닌 원본 마크다운으로 독립 실행 가능한 reveal.js HTML 파일 생성.
 * reveal.js Markdown 플러그인이 브라우저에서 마크다운을 직접 파싱.
 */
export function exportToHTML(config: ExportConfig, markdown: string, filename = 'presentation.html'): void {
  const theme = config.theme || 'black'

  // </script> 가 마크다운에 포함될 경우 HTML 파싱 오류 방지
  const safeMarkdown = markdown.replace(/<\/script/gi, '<\\/script')

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Presentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/theme/${theme}.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section data-markdown data-separator="^\\n---\\n$" data-separator-vertical="^\\n--\\n$">
        <script type="text/template">
${safeMarkdown}
        <\/script>
      </section>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/markdown/markdown.js"><\/script>
  <script>
    Reveal.initialize({
      hash: true,
      plugins: [RevealMarkdown]
    });
  <\/script>
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
