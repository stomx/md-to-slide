import { create } from 'zustand'
import type { SlideStore, Slide, EditorState } from '@/types/slide.types'
import { DEFAULT_MARKDOWN, DEFAULT_EDITOR_STATE } from '@/constants/defaults'
import { DEFAULT_THEME } from '@/constants/themes'

/**
 * Zustand 슬라이드 스토어
 *
 * 전역 상태 관리:
 * - markdown: 원본 마크다운 텍스트
 * - slides: 파싱된 슬라이드 배열
 * - selectedTheme: 현재 선택된 테마
 * - editorState: 에디터 커서 위치 등
 */
export const useSlideStore = create<SlideStore>((set) => ({
  // Initial State
  markdown: DEFAULT_MARKDOWN,
  slides: [],
  selectedTheme: DEFAULT_THEME,
  editorState: DEFAULT_EDITOR_STATE,

  // Actions
  setMarkdown: (markdown: string) =>
    set(() => ({
      markdown,
    })),

  setSlides: (slides: Slide[]) =>
    set(() => ({
      slides,
    })),

  setSelectedTheme: (theme: string) =>
    set(() => ({
      selectedTheme: theme,
    })),

  setEditorState: (state: Partial<EditorState>) =>
    set((prev) => ({
      editorState: {
        ...prev.editorState,
        ...state,
      },
    })),

  reset: () =>
    set(() => ({
      markdown: DEFAULT_MARKDOWN,
      slides: [],
      selectedTheme: DEFAULT_THEME,
      editorState: DEFAULT_EDITOR_STATE,
    })),
}))
