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
  // ========== Initial State (v1.0.0) ==========
  markdown: DEFAULT_MARKDOWN,
  slides: [],
  selectedTheme: DEFAULT_THEME,
  editorState: DEFAULT_EDITOR_STATE,

  // ========== NEW: UX State (v1.1.0) ==========
  isLoading: false,
  loadingMessage: null,
  error: null,
  progress: 0,
  hasSeenOnboarding: typeof window !== 'undefined'
    ? localStorage.getItem('hasSeenOnboarding') === 'true'
    : false,
  keyboardShortcutsEnabled: true,

  // ========== Actions (v1.0.0) ==========
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
      // UX state는 리셋하지 않음
    })),

  // ========== NEW: UX Actions (v1.1.0) ==========
  setLoading: (isLoading: boolean, message?: string) =>
    set(() => ({
      isLoading,
      loadingMessage: message || null,
    })),

  setError: (error: string | null) =>
    set(() => ({
      error,
    })),

  clearError: () =>
    set(() => ({
      error: null,
    })),

  setProgress: (progress: number) =>
    set(() => ({
      progress: Math.min(100, Math.max(0, progress)),
    })),

  setHasSeenOnboarding: (seen: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', String(seen))
    }
    set(() => ({
      hasSeenOnboarding: seen,
    }))
  },

  setKeyboardShortcutsEnabled: (enabled: boolean) =>
    set(() => ({
      keyboardShortcutsEnabled: enabled,
    })),
}))
