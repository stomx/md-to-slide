import PptxGenJS from 'pptxgenjs'

interface PptxExportOptions {
  theme: string
  includeNotes: boolean
  fontFamily?: string
}

// reveal.js 테마 → PPTX 배경색 매핑
const THEME_COLORS: Record<string, { bg: string; text: string }> = {
  black: { bg: '000000', text: 'FFFFFF' },
  white: { bg: 'FFFFFF', text: '000000' },
  league: { bg: '1C1E20', text: 'EEEDEF' },
  beige: { bg: 'F7F3DE', text: '333333' },
  night: { bg: '111111', text: 'EEEDEF' },
  serif: { bg: 'F0EDDE', text: '000000' },
  simple: { bg: 'FFFFFF', text: '000000' },
  solarized: { bg: 'FDF6E3', text: '657B83' },
  moon: { bg: '002B36', text: '93A1A1' },
  dracula: { bg: '282A36', text: 'F8F8F2' },
  sky: { bg: 'F7FBFC', text: '333333' },
  blood: { bg: '222222', text: 'EEEEEE' },
}

export async function exportToPptx(
  revealContainer: HTMLElement,
  options: PptxExportOptions
): Promise<void> {
  const pptx = new PptxGenJS()
  const themeColors = THEME_COLORS[options.theme] || THEME_COLORS.black

  pptx.layout = 'LAYOUT_WIDE'  // 16:9

  // reveal.js DOM에서 <section> 요소들 추출
  const sections = revealContainer.querySelectorAll('.slides > section')

  sections.forEach((section) => {
    // 수직 슬라이드가 있는 경우 (중첩 section)
    const nestedSections = section.querySelectorAll(':scope > section')
    const slideSections = nestedSections.length > 0 ? nestedSections : [section]

    slideSections.forEach((slideSection) => {
      const slide = pptx.addSlide()

      // 배경색 설정
      const bgColor = slideSection.getAttribute('data-background-color')
        || slideSection.getAttribute('data-background')
        || themeColors.bg
      slide.background = { color: bgColor.replace('#', '') }

      let yPos = 0.5  // 현재 Y 위치 (인치)

      // h1 → 제목
      const h1 = slideSection.querySelector('h1')
      if (h1) {
        slide.addText(h1.textContent || '', {
          x: 0.5, y: yPos, w: '90%', h: 1.2,
          fontSize: 36, bold: true, color: themeColors.text,
          align: 'center',
        })
        yPos += 1.4
      }

      // h2 → 부제목
      const h2 = slideSection.querySelector('h2')
      if (h2) {
        slide.addText(h2.textContent || '', {
          x: 0.5, y: yPos, w: '90%', h: 0.8,
          fontSize: 28, bold: true, color: themeColors.text,
          align: 'left',
        })
        yPos += 1.0
      }

      // h3~h6 → 소제목
      slideSection.querySelectorAll('h3, h4, h5, h6').forEach((heading) => {
        slide.addText(heading.textContent || '', {
          x: 0.5, y: yPos, w: '90%', h: 0.6,
          fontSize: 22, bold: true, color: themeColors.text,
        })
        yPos += 0.7
      })

      // ul/ol → 목록
      slideSection.querySelectorAll('ul, ol').forEach((list) => {
        const items = list.querySelectorAll(':scope > li')
        const textItems = Array.from(items).map((li) => ({
          text: li.textContent || '',
          options: { bullet: true, fontSize: 18, color: themeColors.text },
        }))
        if (textItems.length > 0) {
          slide.addText(textItems, {
            x: 0.8, y: yPos, w: '85%', h: textItems.length * 0.5,
          })
          yPos += textItems.length * 0.5 + 0.2
        }
      })

      // p (h1/h2가 아닌 일반 텍스트)
      slideSection.querySelectorAll(':scope > p').forEach((p) => {
        if (p.textContent?.trim()) {
          slide.addText(p.textContent.trim(), {
            x: 0.5, y: yPos, w: '90%', h: 0.5,
            fontSize: 16, color: themeColors.text,
          })
          yPos += 0.6
        }
      })

      // blockquote → 인용문
      slideSection.querySelectorAll('blockquote').forEach((quote) => {
        slide.addText(quote.textContent || '', {
          x: 1.0, y: yPos, w: '80%', h: 0.8,
          fontSize: 18, italic: true, color: themeColors.text,
          align: 'center',
        })
        yPos += 1.0
      })

      // pre > code → 코드 블록
      slideSection.querySelectorAll('pre > code').forEach((code) => {
        slide.addText(code.textContent || '', {
          x: 0.5, y: yPos, w: '90%', h: 1.5,
          fontSize: 12, fontFace: 'Courier New', color: themeColors.text,
          fill: { color: '2D2D2D' },
          valign: 'top',
        })
        yPos += 1.7
      })

      // 발표자 노트
      if (options.includeNotes) {
        const aside = slideSection.querySelector('aside.notes')
        if (aside?.textContent) {
          slide.addNotes(aside.textContent)
        }
      }
    })
  })

  // 다운로드
  await pptx.writeFile({ fileName: 'presentation.pptx' })
}
