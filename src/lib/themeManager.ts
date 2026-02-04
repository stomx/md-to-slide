import type { Theme } from '@/types/slide.types'
import { getThemeByName } from '@/constants/themes'

/**
 * 테마 적용
 *
 * reveal.js 테마 CSS를 동적으로 로드/교체
 *
 * @param themeName - 적용할 테마 이름
 * @returns 적용된 Theme 객체 또는 null
 *
 * @example
 * applyTheme('dracula')
 * // => <link id="reveal-theme" rel="stylesheet" href="/reveal.js/dist/theme/dracula.css">
 */
export function applyTheme(themeName: string): Theme | null {
  const theme = getThemeByName(themeName)
  if (!theme) return null

  // 기존 테마 링크 제거
  const existingLink = document.getElementById('reveal-theme')
  if (existingLink) {
    existingLink.remove()
  }

  // 새 테마 링크 추가
  const link = document.createElement('link')
  link.id = 'reveal-theme'
  link.rel = 'stylesheet'
  link.href = theme.cssUrl

  document.head.appendChild(link)

  return theme
}

/**
 * 현재 적용된 테마 가져오기
 *
 * @returns 현재 테마의 CSS URL 또는 null
 */
export function getCurrentTheme(): string | null {
  const link = document.getElementById('reveal-theme') as HTMLLinkElement
  return link?.href || null
}
