/**
 * 기본값 상수
 */

import { DEFAULT_THEME } from './themes'

/**
 * 기본 마크다운 템플릿
 */
export const DEFAULT_MARKDOWN = `# Welcome to md-to-slide

---

## Features

- Markdown to Slides
- Real-time Preview
- Theme Customization
- Export to PDF/HTML

---

## Vertical Slides

Press Down ↓

-----

### Nested Slide 1

-----

### Nested Slide 2

---

## The End

Thank you!
`

/**
 * Debounce 지연 시간 (ms)
 */
export const DEBOUNCE_DELAY = 300

/**
 * reveal.js 기본 설정
 */
export const REVEAL_CONFIG = {
  hash: true,
  controls: true,
  progress: true,
  center: true,
  transition: 'slide' as const,
  slideNumber: true,
}

/**
 * 기본 에디터 상태
 */
export const DEFAULT_EDITOR_STATE = {
  markdown: DEFAULT_MARKDOWN,
  cursorPosition: 0,
}

/**
 * 내보내기 기본 설정
 */
export const DEFAULT_EXPORT_CONFIG = {
  format: 'pdf' as const,
  includeNotes: false,
  theme: DEFAULT_THEME,
}
