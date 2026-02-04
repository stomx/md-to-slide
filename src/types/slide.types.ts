/**
 * Slide Types
 *
 * reveal.js 슬라이드 시스템을 위한 타입 정의
 */

/**
 * 개별 슬라이드
 */
export interface Slide {
  id: string
  content: string // 원본 마크다운
  html: string // 파싱된 HTML
  order: number
  type: 'horizontal' | 'vertical'
  sectionId?: string
  notes?: string
}

/**
 * 슬라이드 덱 (전체 프레젠테이션)
 */
export interface Deck {
  id: string
  title: string
  slides: Slide[]
  theme: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 테마 정의
 */
export interface Theme {
  name: string
  displayName: string
  builtIn: boolean
  cssUrl: string
  cssVariables?: Record<string, string>
}

/**
 * 섹션 (수평 슬라이드 그룹)
 */
export interface Section {
  id: string
  slides: Slide[]
  order: number
}

/**
 * 내보내기 설정
 */
export interface ExportConfig {
  format: 'pdf' | 'html'
  includeNotes: boolean
  theme: string
  customCss?: string
}

/**
 * 에디터 상태
 */
export interface EditorState {
  markdown: string
  cursorPosition: number
  selectedSlideId?: string
}

/**
 * Zustand Store 상태
 */
export interface SlideStore {
  // State
  markdown: string
  slides: Slide[]
  selectedTheme: string
  editorState: EditorState

  // Actions
  setMarkdown: (markdown: string) => void
  setSlides: (slides: Slide[]) => void
  setSelectedTheme: (theme: string) => void
  setEditorState: (state: Partial<EditorState>) => void
  reset: () => void
}
