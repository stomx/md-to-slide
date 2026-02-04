import type { ExportConfig } from '@/types/slide.types'

/**
 * PDF로 내보내기
 *
 * reveal.js ?print-pdf 파라미터 활용
 *
 * @param config - 내보내기 설정
 *
 * @example
 * exportToPDF({ format: 'pdf', includeNotes: true, theme: 'black' })
 * // => window.open('/?print-pdf', '_blank')
 */
export function exportToPDF(config: ExportConfig): void {
  const params = new URLSearchParams()
  params.set('print-pdf', '')

  if (config.includeNotes) {
    params.set('showNotes', 'true')
  }

  const url = `${window.location.origin}?${params.toString()}`

  // 새 창에서 인쇄 뷰 열기
  const printWindow = window.open(url, '_blank')

  if (printWindow) {
    // 페이지 로드 후 인쇄 대화상자 자동 열기
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    })
  }
}

/**
 * HTML로 내보내기
 *
 * 현재 페이지 HTML을 다운로드
 *
 * @param config - 내보내기 설정
 * @param filename - 저장할 파일명 (기본값: 'slides.html')
 *
 * @example
 * exportToHTML({ format: 'html', theme: 'black' }, 'my-presentation.html')
 */
export function exportToHTML(config: ExportConfig, filename = 'slides.html'): void {
  const htmlContent = document.documentElement.outerHTML

  // Blob 생성
  const blob = new Blob([htmlContent], { type: 'text/html' })

  // 다운로드 링크 생성
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename

  // 자동 다운로드 트리거
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // URL 해제
  URL.revokeObjectURL(link.href)
}
