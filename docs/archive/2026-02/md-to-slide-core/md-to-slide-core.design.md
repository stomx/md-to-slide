# md-to-slide-core Design Document

> **Summary**: reveal.js 기반 마크다운 슬라이드 변환기 기술 설계
>
> **Project**: md-to-slide
> **Version**: 0.1.0
> **Author**: Claude Code
> **Date**: 2026-02-04
> **Status**: Draft
> **Planning Doc**: [md-to-slide-core.plan.md](../../01-plan/features/md-to-slide-core.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | [Schema Definition](../../01-plan/schema.md) | ✅ |
| Phase 2 | [Coding Conventions](../../01-plan/conventions.md) | ✅ |
| Phase 3 | Mockup | N/A |
| Phase 4 | API Spec | N/A (Starter - No backend) |

---

## 1. Overview

### 1.1 Design Goals

이 설계는 다음 목표를 달성합니다:

1. **단순성**: Starter 레벨 구조로 복잡도 최소화
2. **실시간성**: 300ms debounce로 빠른 미리보기 제공
3. **확장성**: 테마 시스템으로 쉬운 커스터마이징
4. **독립성**: reveal.js 로컬 번들로 CDN 의존성 제거
5. **성능**: 1000줄 마크다운을 100ms 이내 파싱

### 1.2 Design Principles

- **Single Responsibility**: 각 컴포넌트는 하나의 역할만 수행
- **Composition over Inheritance**: 컴포넌트 조합으로 기능 구성
- **Immutability**: Zustand store는 불변 상태 관리
- **Type Safety**: TypeScript strict mode로 런타임 에러 방지
- **Performance First**: Debounce, memoization으로 불필요한 렌더링 차단

---

## 2. Architecture

### 2.1 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                       Browser (Client)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐      ┌────────────────────┐          │
│  │  MarkdownEditor    │      │   SlidePreview     │          │
│  │  (Textarea)        │      │   (reveal.js)      │          │
│  └─────────┬──────────┘      └─────────┬──────────┘          │
│            │                           │                     │
│            │ onChange (debounce 300ms) │                     │
│            ↓                           ↓                     │
│  ┌─────────────────────────────────────────────┐             │
│  │         Zustand Store (Global State)        │             │
│  │  - markdown: string                         │             │
│  │  - selectedTheme: string                    │             │
│  │  - isDirty: boolean                         │             │
│  └─────────┬───────────────────────────────────┘             │
│            │                                                 │
│            ↓                                                 │
│  ┌─────────────────────────────────────────────┐             │
│  │      Markdown Parser (lib/markdownParser)   │             │
│  │  - splitSlides(): Slide[]                   │             │
│  │  - parseContent(): HTML                     │             │
│  └─────────┬───────────────────────────────────┘             │
│            │                                                 │
│            ↓                                                 │
│  ┌─────────────────────────────────────────────┐             │
│  │   reveal.js Renderer (SlidePreview)         │             │
│  │  - Reveal.initialize()                      │             │
│  │  - Reveal.sync()                            │             │
│  └─────────────────────────────────────────────┘             │
│                                                              │
│  ┌────────────────────┐      ┌────────────────────┐          │
│  │  ThemeSelector     │      │  ExportButtons     │          │
│  │  (Dropdown)        │      │  (PDF/HTML)        │          │
│  └────────────────────┘      └────────────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow (데이터 흐름)

```
사용자 입력 (Markdown)
         │
         ├──→ Zustand Store 즉시 업데이트 (setMarkdown)
         │
         └──→ Debounce (300ms) 후 파싱
                   │
                   ↓
              parseMarkdownToSlides()
                   │
                   ↓
              Slide[] 배열 생성 → Store 저장
                   │
                   ↓
              slidesToRevealHTML() → innerHTML 주입
                   │
                   ↓
              reveal.js sync()

테마 변경 시:
         CSS link href 업데이트 (동적 로드)
```

### 2.3 Component Dependencies

```
App (page.tsx)
 │
 ├─→ ResponsiveLayout (v1.1.0)
 │    ├─→ useMediaQuery (hooks)
 │    └─→ Tabs (ui)
 │
 ├─→ MarkdownEditor
 │    ├─→ useSlideStore (Zustand)
 │    ├─→ markdownParser (lib)
 │    ├─→ errorHandler (lib)
 │    ├─→ LoadingSpinner (v1.1.0)
 │    └─→ showToast (Toast, v1.1.0)
 │
 ├─→ SlidePreview
 │    ├─→ useSlideStore (Zustand)
 │    ├─→ markdownParser (lib)
 │    └─→ reveal.js (public)
 │
 ├─→ ThemeSelector
 │    ├─→ useSlideStore (Zustand)
 │    └─→ BUILTIN_THEMES (constants)
 │
 └─→ ExportButtons
      ├─→ useSlideStore (Zustand)
      ├─→ exportHelper (lib)
      └─→ showToast (Toast, v1.1.0)

Layout (layout.tsx)
 └─→ ToastProvider (v1.1.0)
```

---

## 3. Data Model

### 3.1 Zustand Store Structure

```typescript
// store/slide-store.ts

interface SlideStore {
  // ========== State (v1.0.0) ==========
  markdown: string                    // 사용자 입력 마크다운
  selectedTheme: string               // 현재 테마 이름
  isDirty: boolean                    // 저장 안 된 변경사항 여부
  slides: Slide[]                     // 파싱된 슬라이드 배열
  editorState: EditorState            // 에디터 커서 위치 등

  // ========== UX State (v1.1.0) ==========
  isLoading: boolean                  // 로딩 상태
  loadingMessage: string | null       // 로딩 메시지
  error: string | null                // 에러 메시지
  progress: number                    // 진행률 (0-100)
  hasSeenOnboarding: boolean          // 온보딩 완료 여부
  keyboardShortcutsEnabled: boolean   // 키보드 단축키 활성화

  // ========== Actions (v1.0.0) ==========
  setMarkdown: (markdown: string) => void
  setSelectedTheme: (theme: string) => void
  setSlides: (slides: Slide[]) => void
  setEditorState: (state: Partial<EditorState>) => void
  setIsDirty: (dirty: boolean) => void
  reset: () => void

  // ========== UX Actions (v1.1.0) ==========
  setLoading: (isLoading: boolean, message?: string) => void
  setError: (error: string | null) => void
  clearError: () => void
  setProgress: (progress: number) => void
  setHasSeenOnboarding: (seen: boolean) => void
  setKeyboardShortcutsEnabled: (enabled: boolean) => void
}

// 초기 상태
const initialState = {
  markdown: DEFAULT_MARKDOWN,
  selectedTheme: DEFAULT_THEME,
  isDirty: false,
  slides: [],
  editorState: DEFAULT_EDITOR_STATE,
  // v1.1.0 UX
  isLoading: false,
  loadingMessage: null,
  error: null,
  progress: 0,
  hasSeenOnboarding: false,  // localStorage 연동
  keyboardShortcutsEnabled: true,
}
```

### 3.2 Entity Definitions (from Schema)

```typescript
// types/slide.types.ts

export interface Slide {
  id: string                          // UUID
  content: string                     // 마크다운 원본
  html: string                        // 파싱된 HTML
  order: number                       // 슬라이드 순서
  type: 'horizontal' | 'vertical'     // 수평/수직
  sectionId?: string                  // 소속 섹션 ID
  notes?: string                      // 발표자 노트
  background?: string                 // 배경 이미지/색상
  transition?: string                 // 전환 효과
}

export interface Theme {
  name: string                        // 'black', 'white' 등
  displayName: string                 // 'Black', 'White' (UI 표시)
  builtIn: boolean                    // reveal.js 기본 테마 여부
  cssUrl: string                      // CSS 파일 경로
  cssVariables?: Record<string, string>  // CSS 커스텀 변수
  preview?: string                    // 썸네일 이미지 URL
}

export interface Deck {
  id: string
  title: string
  slides: Slide[]
  theme: string
  createdAt: Date
  updatedAt: Date
}

export interface Section {
  id: string
  slides: Slide[]
  order: number
}

export interface ExportConfig {
  format: 'pdf' | 'html'
  includeNotes: boolean               // 발표자 노트 포함 여부
  theme: string                       // 현재 테마 이름
  customCss?: string                  // 사용자 정의 CSS
}

export interface EditorState {
  markdown: string
  cursorPosition: number
  selectedSlideId?: string
}
```

### 3.3 Constants (상수 정의)

```typescript
// constants/separators.ts
export const HORIZONTAL_SEPARATOR = /^\r?\n---\r?\n$/m
export const VERTICAL_SEPARATOR = /^\r?\n-----\r?\n$/m
export const NOTES_SEPARATOR = /^notes?:/i
export const SEPARATOR_STRINGS = {
  horizontal: '\n---\n',
  vertical: '\n-----\n',
} as const

// constants/themes.ts
export const BUILTIN_THEMES: Theme[] = [
  { name: 'black', displayName: 'Black', builtIn: true, cssUrl: '/reveal.js/dist/theme/black.css' },
  { name: 'white', displayName: 'White', builtIn: true, cssUrl: '/reveal.js/dist/theme/white.css' },
  { name: 'league', displayName: 'League', builtIn: true, cssUrl: '/reveal.js/dist/theme/league.css' },
  // ... 12개 테마
]
export const DEFAULT_THEME = 'black'
export function getThemeByName(name: string): Theme | undefined { ... }

// constants/defaults.ts
export const DEBOUNCE_DELAY = 300
export const DEFAULT_MARKDOWN = `# Welcome to md-to-slide\n---\n## Features\n...`
export const DEFAULT_EDITOR_STATE = { markdown: DEFAULT_MARKDOWN, cursorPosition: 0 }
export const REVEAL_CONFIG = { hash: true, controls: true, progress: true, ... }  // 향후 확장용
export const DEFAULT_EXPORT_CONFIG = { format: 'pdf', includeNotes: false, theme: DEFAULT_THEME }  // 향후 확장용
```

---

## 4. Component Design

### 4.1 Component List

| Component | Location | Responsibility | Props |
|-----------|----------|----------------|-------|
| `MarkdownEditor` | `components/MarkdownEditor.tsx` | 마크다운 입력 UI | - |
| `SlidePreview` | `components/SlidePreview.tsx` | reveal.js 미리보기 | - |
| `ThemeSelector` | `components/ThemeSelector.tsx` | 테마 선택 드롭다운 | - |
| `ExportButtons` | `components/ExportButtons.tsx` | PDF/HTML 내보내기 버튼 | - |
| `ResponsiveLayout` | `components/ResponsiveLayout.tsx` | 반응형 레이아웃 (v1.1.0) | `children` |
| `Toast` / `ToastProvider` | `components/Toast.tsx` | 토스트 알림 (v1.1.0) | - |
| `HelpModal` | `components/HelpModal.tsx` | 도움말 모달 (v1.1.0) | `open`, `onClose` |
| `LoadingSpinner` | `components/LoadingSpinner.tsx` | 로딩 인디케이터 (v1.1.0) | `size`, `message`, `overlay` |
| `ProgressBar` | `components/ProgressBar.tsx` | 진행률 바 (v1.1.0, 준비됨*) | `progress`, `message`, `showPercentage` |
| `KeyboardShortcutModal` | `components/KeyboardShortcutModal.tsx` | 키보드 단축키 모달 (v1.1.0, 준비됨*) | `open`, `onClose` |
| `OnboardingTutorial` | `components/OnboardingTutorial.tsx` | 온보딩 튜토리얼 (v1.1.0, 준비됨*) | - |

> **\* 준비됨(Ready)**: 컴포넌트가 구현되어 있으나, 아직 `page.tsx`에 연결되지 않은 상태입니다. 향후 UX 강화 시 바로 통합 가능합니다.
| `Button` | `components/ui/Button.tsx` | shadcn/ui 버튼 (Radix) | `onClick`, `variant` |
| `Select` | `components/ui/Select.tsx` | shadcn/ui 드롭다운 (Radix) | `value`, `onValueChange` |
| `Textarea` | `components/ui/Textarea.tsx` | shadcn/ui 텍스트 영역 (Radix) | `value`, `onChange` |
| `Dialog` | `components/ui/dialog.tsx` | shadcn/ui 다이얼로그 (Radix) | `open`, `onOpenChange` |
| `Tabs` | `components/ui/tabs.tsx` | shadcn/ui 탭 (Radix) | `value`, `onValueChange` |
| `Tooltip` | `components/ui/tooltip.tsx` | shadcn/ui 툴팁 (Radix) | `content` |

### 4.2 MarkdownEditor Component

```typescript
'use client'

// components/MarkdownEditor.tsx

import React, { useEffect, useCallback } from 'react'
import { useSlideStore } from '@/store/slide-store'
import { debounce } from '@/lib/utils'
import { parseMarkdownToSlides } from '@/lib/markdownParser'
import { handleError } from '@/lib/errorHandler'
import { DEBOUNCE_DELAY } from '@/constants/defaults'
import { Textarea } from './ui/Textarea'
import { LoadingSpinner } from './LoadingSpinner'
import { showToast } from './Toast'

export function MarkdownEditor() {
  const { markdown, setMarkdown, setSlides, isLoading, error, setLoading, setError, clearError } = useSlideStore()

  // Debounced 파싱 함수 with error handling
  const debouncedParse = useCallback(
    debounce(async (text: string) => {
      setLoading(true, 'Parsing markdown...')
      clearError()
      try {
        const parsedSlides = parseMarkdownToSlides(text)
        setSlides(parsedSlides)
        showToast.success(`${parsedSlides.length} slides parsed`)
      } catch (err) {
        const result = handleError(err, 'Markdown parsing')
        setError(result.message)
        showToast.error(result.message)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_DELAY),
    [setSlides, setLoading, setError, clearError]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value)      // 즉시 store 업데이트
    debouncedParse(e.target.value)   // 파싱만 debounce
  }

  // 초기 파싱: 마운트 시 기본 마크다운을 파싱
  useEffect(() => {
    try {
      const parsedSlides = parseMarkdownToSlides(markdown)
      setSlides(parsedSlides)
    } catch (err) {
      const result = handleError(err, 'Initial markdown parsing')
      setError(result.message)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // Textarea + LoadingSpinner overlay + Error Alert (role="alert")
  )
}
```

**Props**: 없음 (Zustand store 사용)

**State**: 없음 (전역 상태 사용, v1.1.0 `isLoading`, `error` 포함)

**Responsibilities**:
- 마크다운 입력 받기
- Debounce 적용하여 파싱 + store 업데이트
- 초기 마운트 시 기본 마크다운 파싱
- 에러 처리 (`handleError` + `showToast.error`)
- 로딩 상태 표시 (`LoadingSpinner` overlay)

---

### 4.3 SlidePreview Component

```typescript
'use client'

// components/SlidePreview.tsx

import React, { useEffect, useRef, useState } from 'react'
import { useSlideStore } from '@/store/slide-store'
import { slidesToRevealHTML } from '@/lib/markdownParser'
import { REVEAL_CONFIG } from '@/constants/defaults'

export function SlidePreview() {
  const { slides, selectedTheme } = useSlideStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const initializingRef = useRef(false)

  // reveal.js 초기화 (한 번만, dynamic import)
  useEffect(() => {
    if (initializingRef.current) return
    if (typeof window === 'undefined') return

    initializingRef.current = true

    const initReveal = async () => {
      const Reveal = (await import('reveal.js')).default

      if (!containerRef.current) return

      const revealInstance = new Reveal(containerRef.current, {
        ...REVEAL_CONFIG,
        embedded: true,
        hash: false,
        width: 960,
        height: 700,
      })

      revealInstance.on('ready', () => setIsReady(true))
      await revealInstance.initialize()
      revealRef.current = revealInstance
    }

    initReveal()
    return () => {
      if (revealRef.current) {
        revealRef.current.destroy()
        revealRef.current = null
        initializingRef.current = false
      }
    }
  }, [])

  // 슬라이드 업데이트 (innerHTML 주입 + sync)
  useEffect(() => {
    if (!isReady || !revealRef.current) return

    const slidesHTML = slidesToRevealHTML(slides)
    const slidesContainer = containerRef.current?.querySelector('.slides')

    if (slidesContainer) {
      slidesContainer.innerHTML = slidesHTML
      revealRef.current.sync()
      revealRef.current.slide(0, 0)
    }
  }, [slides, isReady])

  // 테마 변경 시 CSS link href 업데이트
  useEffect(() => {
    if (!isReady) return
    const themeLink = document.getElementById('reveal-theme-link') as HTMLLinkElement
    if (themeLink) {
      themeLink.href = `/reveal.js/dist/theme/${selectedTheme}.css`
    }
  }, [selectedTheme, isReady])

  return (
    <div className="relative w-full h-full bg-gray-900">
      <div ref={containerRef} className="reveal-container">
        <div className="reveal">
          <div className="slides">
            <section><h1>Loading...</h1></section>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Props**: 없음

**Refs**: `containerRef` (reveal.js DOM), `revealRef` (reveal.js API)

**State**: `isReady` (reveal.js 초기화 완료 여부)

**Responsibilities**:
- reveal.js 초기화 및 라이프사이클 관리 (dynamic import)
- `slidesToRevealHTML()`로 HTML 생성 → `innerHTML` 주입 → `sync()`
- 테마 변경 시 CSS link href 업데이트

---

### 4.4 ThemeSelector Component

```typescript
'use client'

// components/ThemeSelector.tsx

import React from 'react'

import { useSlideStore } from '@/store/slide-store'
import { BUILTIN_THEMES } from '@/constants/themes'

import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from './ui/Select'

export function ThemeSelector() {
  const { selectedTheme, setSelectedTheme } = useSlideStore()

  // 테마 변경 핸들러 (iframe이 자동으로 postMessage를 통해 테마 적용)
  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="theme-selector" className="text-sm font-medium text-gray-700">
        Theme
      </label>
      <Select value={selectedTheme} onValueChange={handleThemeChange}>
        <SelectTrigger id="theme-selector" className="w-48 bg-white">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {BUILTIN_THEMES.map((theme) => (
            <SelectItem key={theme.name} value={theme.name} className="text-gray-900">
              {theme.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

**Props**: 없음

**Responsibilities**:
- 테마 목록 표시
- 테마 변경 시 store 업데이트

---

### 4.5 ExportButtons Component

```typescript
'use client'

// components/ExportButtons.tsx

import React from 'react'
import { FileDown, FileText } from 'lucide-react'

import { useSlideStore } from '@/store/slide-store'
import { exportToPDF, exportToHTML } from '@/lib/exportHelper'

import type { ExportConfig } from '@/types/slide.types'

import { Button } from './ui/Button'
import { showToast } from './Toast'

export function ExportButtons() {
  const { selectedTheme } = useSlideStore()

  const handleExportPDF = () => {
    try {
      const config: ExportConfig = {
        format: 'pdf',
        includeNotes: false,
        theme: selectedTheme,
      }
      exportToPDF(config)
    } catch {
      showToast.error('PDF 내보내기에 실패했습니다.')
    }
  }

  const handleExportHTML = () => {
    try {
      const config: ExportConfig = {
        format: 'html',
        includeNotes: false,
        theme: selectedTheme,
      }
      exportToHTML(config, 'presentation.html')
    } catch {
      showToast.error('HTML 내보내기에 실패했습니다.')
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportPDF} variant="outline" size="sm">
        <FileDown className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button onClick={handleExportHTML} variant="default" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Export HTML
      </Button>
    </div>
  )
}
```

**Props**: 없음

**Responsibilities**:
- PDF/HTML 내보내기 트리거
- 에러 처리 및 사용자 피드백

---

## 5. Algorithm Design (알고리즘 설계)

### 5.1 Markdown Parsing Algorithm

```typescript
// lib/markdownParser.ts

import { marked } from 'marked'
import DOMPurify from 'dompurify'

import { HORIZONTAL_SEPARATOR, VERTICAL_SEPARATOR } from '@/constants/separators'
import type { Slide } from '@/types/slide.types'

/**
 * 마크다운을 Slide[] 배열로 변환
 * @param markdown - 마크다운 원본
 * @returns Slide 배열
 */
export function parseMarkdownToSlides(markdown: string): Slide[] {
  // 1. 수평 슬라이드 분리 (---)
  const horizontalSections = markdown.split(HORIZONTAL_SEPARATOR)

  const slides: Slide[] = []
  let globalOrder = 0

  horizontalSections.forEach((section, hIndex) => {
    // 2. 수직 슬라이드 분리 (-----)
    const verticalSlides = section.split(VERTICAL_SEPARATOR)

    verticalSlides.forEach((content, vIndex) => {
      const trimmedContent = content.trim()
      if (!trimmedContent) return  // 빈 슬라이드 건너뛰기

      // 3. 마크다운 → HTML 변환 + XSS 방지 (DOMPurify)
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
```

**시간 복잡도**: O(n) (n = 마크다운 길이)

**성능 목표**: 1000줄 마크다운을 100ms 이내 파싱

#### Utility Functions

```typescript
// lib/utils.ts

/**
 * Debounce 유틸리티
 * @param func - 디바운스할 함수
 * @param delay - 지연 시간 (ms)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 클래스명 병합 유틸리티
 * @param classes - 병합할 클래스명들
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

---

### 5.2 Theme Application

테마 변경은 SlidePreview 컴포넌트에서 직접 CSS link href를 업데이트하는 방식을 사용합니다:

```typescript
// components/SlidePreview.tsx - 테마 변경 시 CSS link href 업데이트

useEffect(() => {
  if (!isReady) return
  const themeLink = document.getElementById('reveal-theme-link') as HTMLLinkElement
  if (themeLink) {
    themeLink.href = `/reveal.js/dist/theme/${selectedTheme}.css`
  }
}, [selectedTheme, isReady])
```

> **참고**: `lib/themeManager.ts`에 `applyTheme()` 및 `getCurrentTheme()` 유틸리티가 존재하며, 향후 커스텀 테마 CSS Variables 오버라이드 등 고급 기능 확장 시 활용할 수 있습니다. 현재 기본 테마는 CSS link href 변경으로 충분합니다.

---

### 5.3 Export Algorithm

#### 5.3.1 PDF Export

```typescript
// lib/exportHelper.ts

/**
 * PDF로 내보내기 (브라우저 인쇄 API 사용)
 * 동기 함수 - reveal.js ?print-pdf 파라미터 활용
 * @param config - PDF 내보내기 설정
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
```

#### 5.3.2 HTML Export

```typescript
/**
 * HTML 파일로 내보내기 (DOM outerHTML 사용)
 * 동기 함수 - 현재 페이지 DOM을 그대로 HTML로 내보내기
 * @param config - HTML 내보내기 설정
 * @param filename - 저장할 파일명 (기본값: 'slides.html')
 */
export function exportToHTML(config: ExportConfig, filename = 'slides.html'): void {
  // 1. 현재 페이지 전체 HTML 가져오기
  const htmlContent = document.documentElement.outerHTML

  // 2. Blob 생성
  const blob = new Blob([htmlContent], { type: 'text/html' })

  // 3. 다운로드 링크 생성 및 트리거
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 4. URL 해제
  URL.revokeObjectURL(link.href)
}
```

---

## 6. UI/UX Design

### 6.1 Screen Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Header                                                       │
│  [Logo] md-to-slide       [Theme Selector ▼]  [Export ▼]     │
├──────────────────────────┬───────────────────────────────────┤
│                          │                                   │
│  Markdown Editor         │   Slide Preview (reveal.js)       │
│  ┌────────────────────┐  │   ┌─────────────────────────────┐│
│  │# Slide 1           │  │   │                             ││
│  │                    │  │   │      Welcome Slide          ││
│  │---                 │  │   │                             ││
│  │                    │  │   │                             ││
│  │# Slide 2           │  │   └─────────────────────────────┘│
│  │                    │  │   ◀ 1 / 5 ▶                       │
│  └────────────────────┘  │                                   │
│                          │                                   │
│  50%                     │   50%                             │
├──────────────────────────┴───────────────────────────────────┤
│  Footer: Slide count: 5 | Theme: Black | Status: Saved      │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 User Flow

```
1. 페이지 로드
   ↓
2. 샘플 마크다운 자동 로드
   ↓
3. 사용자 마크다운 입력
   ↓
4. 실시간 미리보기 (300ms debounce)
   ↓
5. 테마 선택 (드롭다운)
   ↓
6. 내보내기 버튼 클릭
   ↓
7. PDF/HTML 다운로드
```

### 6.3 Responsive Design

- **Desktop** (>= 1024px): 좌우 분할 (50:50)
- **Tablet** (640px ~ 1023px): 탭 기반 전환 (Editor / Preview 탭)
- **Mobile** (< 640px): 세로 배치 (에디터 위, 미리보기 아래)

---

## 7. Error Handling

### 7.1 Error Scenarios

| Error Type | Cause | User Impact | Handling Strategy |
|-----------|-------|-------------|-------------------|
| **Parsing Error** | 잘못된 마크다운 문법 | 슬라이드 미렌더링 | 에러 표시, 기본 슬라이드 표시 |
| **reveal.js Load Fail** | CDN 오류 (로컬 번들 사용 시 없음) | 미리보기 안 됨 | Fallback to local bundle |
| **Theme Load Fail** | CSS 파일 404 | 기본 테마로 대체 | Fallback to 'black' theme |
| **Export Fail** | 브라우저 미지원 | 내보내기 실패 | Alert 메시지 표시 |

### 7.2 Error Handling Code

```typescript
// components/MarkdownEditor.tsx - 에러 알림 + Toast 패턴

import { handleError } from '@/lib/errorHandler'
import { showToast } from './Toast'

// Debounced 파싱에서 에러 처리
try {
  const parsedSlides = parseMarkdownToSlides(text)
  setSlides(parsedSlides)
  showToast.success(`${parsedSlides.length} slides parsed`)
} catch (err) {
  const result = handleError(err, 'Markdown parsing')
  setError(result.message)
  showToast.error(result.message)
}

// UI: Error Alert Banner (role="alert", aria-live="assertive")
{error && (
  <div role="alert" aria-live="assertive"
    className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
    <strong>Error: </strong><span>{error}</span>
    <button onClick={clearError} aria-label="Dismiss error">×</button>
  </div>
)}
```

```typescript
// components/ExportButtons.tsx - Export 에러 처리

const handleExportPDF = () => {
  try {
    exportToPDF(config)
  } catch {
    showToast.error('PDF 내보내기에 실패했습니다.')
  }
}
```

### 7.3 Error Handling Utilities

```typescript
// lib/errorHandler.ts - 커스텀 에러 클래스 및 유틸리티

export class MarkdownParsingError extends Error { lineNumber?: number }
export class ExportError extends Error { recoverable: boolean }
export interface ErrorResult { message: string; recoverable: boolean; retry?: () => void }

export function handleError(error: unknown, context: string, options?: { onRetry?: () => void }): ErrorResult
export async function withErrorHandling<T>(fn: () => Promise<T>, context: string, options?: { onRetry?: () => void }): Promise<T>
```

### 7.4 Toast Notification API

```typescript
// components/Toast.tsx - showToast API

showToast.success(message)   // 성공 알림
showToast.error(message, options?: { action?: { label, onClick } })  // 에러 알림 (액션 버튼 지원)
showToast.warning(message)   // 경고 알림
showToast.info(message)      // 정보 알림
showToast.promise(promise, { loading, success, error })  // Promise 추적
```

---

## 8. Security Considerations

- [x] **XSS 방지**: `marked.js`는 기본적으로 HTML을 sanitize하지 않으므로 `DOMPurify` 추가 고려
- [x] **CSP 설정**: Content Security Policy로 스크립트 실행 제한 (선택 사항)
- [ ] **파일 업로드 검증**: 로컬 파일 시스템 사용 시 `.md` 확장자만 허용
- [x] **환경 변수 노출 방지**: `NEXT_PUBLIC_` 접두사만 클라이언트 노출

**현재 보안 수준**: Starter 레벨, 백엔드 없음, 최소 보안 위험

---

## 9. Clean Architecture (Starter Level)

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI components, user interaction | `src/components/`, `src/app/` |
| **Application** | Business logic, state management | `src/lib/`, `src/store/` |
| **Domain** | Types, constants | `src/types/`, `src/constants/` |

### 9.2 Dependency Rules

```
┌─────────────────────────────────────────┐
│   Dependency Direction (Starter)        │
├─────────────────────────────────────────┤
│                                         │
│   components/ ──→ lib/ ──→ types/       │
│        │           ↑                    │
│        └──→ store/ ┘                    │
│                                         │
│   Rule: UI는 lib 사용, lib는 types만    │
│         types는 독립적                   │
│                                         │
└─────────────────────────────────────────┘
```

### 9.3 File Import Rules

```typescript
// ✅ Good - components/ → lib/
// components/MarkdownEditor.tsx
import { debounce } from '@/lib/utils'
import { useSlideStore } from '@/store/slide-store'

// ✅ Good - lib/ → types/
// lib/markdownParser.ts
import type { Slide } from '@/types/slide.types'

// ❌ Bad - lib/ → components/
// lib/markdownParser.ts
import { MarkdownEditor } from '@/components/MarkdownEditor'  // ❌
```

### 9.4 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| `MarkdownEditor` | Presentation | `src/components/MarkdownEditor.tsx` |
| `SlidePreview` | Presentation | `src/components/SlidePreview.tsx` |
| `ThemeSelector` | Presentation | `src/components/ThemeSelector.tsx` |
| `ExportButtons` | Presentation | `src/components/ExportButtons.tsx` |
| `ResponsiveLayout` | Presentation | `src/components/ResponsiveLayout.tsx` (v1.1.0) |
| `Toast` / `ToastProvider` | Presentation | `src/components/Toast.tsx` (v1.1.0) |
| `HelpModal` | Presentation | `src/components/HelpModal.tsx` (v1.1.0) |
| `LoadingSpinner` | Presentation | `src/components/LoadingSpinner.tsx` (v1.1.0) |
| `parseMarkdownToSlides()` | Application | `src/lib/markdownParser.ts` |
| `applyTheme()`, `getCurrentTheme()` | Application | `src/lib/themeManager.ts` (유틸리티, 향후 확장용) |
| `exportToPDF()` | Application | `src/lib/exportHelper.ts` |
| `handleError()`, `withErrorHandling()` | Application | `src/lib/errorHandler.ts` (v1.1.0) |
| `MarkdownParsingError`, `ExportError` | Application | `src/lib/errorHandler.ts` (커스텀 에러 클래스) |
| `withLoading()`, `setLoadingState()`, `setProgressState()` | Application | `src/lib/loadingManager.ts` (v1.1.0, DI 패턴) |
| `debounce()`, `cn()` | Application | `src/lib/utils.ts` |
| `useSlideStore` | Application | `src/store/slide-store.ts` |
| `useIsMobile`, `useIsTablet`, `useIsDesktop` | Application | `src/hooks/useMediaQuery.ts` (v1.1.0) |
| `useKeyboardShortcut`, `formatShortcut()` | Application | `src/hooks/useKeyboardShortcut.ts` (v1.1.0) |
| `Slide`, `Theme`, `ExportConfig` | Domain | `src/types/slide.types.ts` |
| `ToastOptions`, `KeyboardShortcut` | Domain | `src/types/ux.types.ts` (v1.1.0) |
| `BUILTIN_THEMES` | Domain | `src/constants/themes.ts` |
| `HORIZONTAL_SEPARATOR` | Domain | `src/constants/separators.ts` |
| `DEFAULT_MARKDOWN` | Domain | `src/constants/defaults.ts` |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Components | PascalCase | `MarkdownEditor`, `SlidePreview` |
| Functions | camelCase | `parseMarkdownToSlides()`, `applyTheme()` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_THEME`, `DEBOUNCE_DELAY` |
| Types | PascalCase | `Slide`, `Theme`, `ExportConfig` |
| Files (component) | PascalCase.tsx | `MarkdownEditor.tsx` |
| Files (ui/shadcn) | lowercase.tsx | `dialog.tsx`, `tabs.tsx`, `tooltip.tsx` (shadcn/ui 컨벤션) |
| Files (utility) | camelCase.ts | `markdownParser.ts`, `exportHelper.ts` |
| Folders | kebab-case | `markdown-editor/` |

### 10.2 Import Order (Example)

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. External libraries
import { marked } from 'marked'
import { create } from 'zustand'

// 3. Internal modules (absolute @/)
import { parseMarkdownToSlides } from '@/lib/markdownParser'
import { useSlideStore } from '@/store/slide-store'

// 4. Types (import type)
import type { Slide, Theme } from '@/types/slide.types'

// 5. Relative imports (./)
import { Button } from './ui/Button'
import { showToast } from './Toast'

// 6. Styles
import './styles.css'
```

### 10.3 Environment Variables (Optional)

> Starter 레벨에서는 환경 변수 없이 로컬 번들을 사용합니다. 향후 확장 시 사용 가능한 변수:

| Variable | Purpose | Exposed | Value | Status |
|----------|---------|:-------:|-------|:------:|
| `NEXT_PUBLIC_APP_URL` | 앱 URL | ✅ | `http://localhost:3000` | Optional |
| `NEXT_PUBLIC_REVEAL_CDN` | reveal.js CDN (Fallback) | ✅ | `https://cdn.jsdelivr.net/npm/reveal.js@5.0.4` | Optional |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/
│   ├── page.tsx                    # 메인 페이지
│   ├── layout.tsx                  # 레이아웃 (ToastProvider, reveal.js CSS, monokai highlight CSS 포함)
│   └── globals.css                 # Tailwind CSS + shadcn/ui CSS Variables + reveal.js 컨테이너 스타일
├── components/
│   ├── MarkdownEditor.tsx          # 마크다운 입력 에디터
│   ├── SlidePreview.tsx            # reveal.js 미리보기
│   ├── ThemeSelector.tsx           # 테마 선택 드롭다운
│   ├── ExportButtons.tsx           # PDF/HTML 내보내기 버튼
│   ├── ResponsiveLayout.tsx        # 반응형 레이아웃 (v1.1.0)
│   ├── Toast.tsx                   # 토스트 알림 (v1.1.0)
│   ├── HelpModal.tsx               # 도움말 모달 (v1.1.0)
│   ├── LoadingSpinner.tsx          # 로딩 인디케이터 (v1.1.0)
│   ├── ProgressBar.tsx             # 진행률 바 (v1.1.0)
│   ├── KeyboardShortcutModal.tsx   # 키보드 단축키 모달 (v1.1.0)
│   ├── OnboardingTutorial.tsx      # 온보딩 튜토리얼 (v1.1.0)
│   └── ui/                        # shadcn/ui (Radix UI)
│       ├── Button.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       └── tooltip.tsx
├── lib/
│   ├── markdownParser.ts           # 마크다운 → Slide[] 변환 (DOMPurify)
│   ├── themeManager.ts             # 테마 적용 유틸리티 (향후 확장용)
│   ├── exportHelper.ts             # PDF/HTML 내보내기
│   ├── errorHandler.ts             # 에러 처리 유틸리티 (v1.1.0)
│   ├── loadingManager.ts           # 로딩 상태 관리 (v1.1.0, DI 패턴)
│   ├── utils.ts                    # debounce, cn 등
│   └── __tests__/                  # Vitest 테스트
│       ├── markdownParser.test.ts   # 파서 단위 테스트 (11 tests)
│       ├── utils.test.ts            # 유틸리티 단위 테스트 (6 tests)
│       └── storeIntegration.test.ts # Store ↔ Parser 통합 테스트 (4 tests)
├── hooks/
│   ├── useMediaQuery.ts            # 반응형 미디어쿼리 (v1.1.0)
│   ├── useKeyboardShortcut.ts      # 키보드 단축키 (v1.1.0)
│   └── useFocusTrap.ts             # 포커스 트랩 (v1.1.0)
├── types/
│   ├── slide.types.ts              # Slide, Theme, ExportConfig, SlideStore 타입
│   ├── ux.types.ts                 # UX 관련 타입 (v1.1.0)
│   └── reveal.d.ts                 # reveal.js 타입 선언
├── store/
│   └── slide-store.ts              # Zustand 전역 상태 (v1.0.0 + v1.1.0 UX)
├── constants/
│   ├── themes.ts                   # 12개 테마 정의
│   ├── separators.ts               # 마크다운 구분자 정규식
│   └── defaults.ts                 # 기본값
└── public/
    └── reveal.js/                  # reveal.js 라이브러리 (로컬)
vitest.config.ts                      # Vitest 테스트 설정 (프로젝트 루트)
```

> **Note**: hooks를 사용하는 클라이언트 컴포넌트(`MarkdownEditor`, `SlidePreview`, `ThemeSelector`, `ExportButtons`, `ResponsiveLayout`, `Toast`, `HelpModal`, `KeyboardShortcutModal`, `OnboardingTutorial`, `hooks/*`, `app/page.tsx`, `ui/Select.tsx`)에는 `'use client'` 디렉티브가 필수입니다. 순수 presentational 컴포넌트(`LoadingSpinner`, `ProgressBar`, `Button`, `Textarea`)와 Radix wrapper(`dialog`, `tabs`, `tooltip`)는 부모 client 컴포넌트에서 호출되므로 `'use client'`가 불필요합니다.

### 11.2 Implementation Order (구현 순서)

#### Phase 1: 프로젝트 초기화
- [ ] Next.js 15 프로젝트 생성 (`create-next-app`)
- [ ] TypeScript, Tailwind CSS 설정
- [ ] reveal.js 로컬 번들 다운로드 (`public/reveal.js/`)
- [ ] ESLint, Prettier 설정

#### Phase 2: 타입 및 상수 정의
- [ ] `types/slide.types.ts` 작성 (Slide, Theme, ExportConfig)
- [ ] `constants/themes.ts` 작성 (12개 테마 정의)
- [ ] `constants/separators.ts` 작성 (정규식)
- [ ] `constants/defaults.ts` 작성 (기본값)

#### Phase 3: Zustand Store
- [ ] `store/slide-store.ts` 작성
- [ ] 초기 상태 정의 (markdown, selectedTheme, isDirty)
- [ ] Actions 정의 (setMarkdown, setTheme, reset)

#### Phase 4: 유틸리티 함수
- [ ] `lib/markdownParser.ts` 작성
  - [ ] `parseMarkdownToSlides()` 구현
  - [ ] marked.js 통합
- [ ] `lib/utils.ts` 작성
  - [ ] `debounce()` 구현
- [ ] `lib/themeManager.ts` 작성
  - [ ] `applyTheme()` 구현
- [ ] `lib/exportHelper.ts` 작성
  - [ ] `exportToPDF()` 구현
  - [ ] `exportToHTML()` 구현

#### Phase 5: UI 컴포넌트
- [ ] `components/ui/Button.tsx` (shadcn/ui - Radix)
- [ ] `components/ui/Select.tsx` (shadcn/ui - Radix)
- [ ] `components/ui/Textarea.tsx` (shadcn/ui - Radix)
- [ ] `components/ui/dialog.tsx` (shadcn/ui - Radix)
- [ ] `components/ui/tabs.tsx` (shadcn/ui - Radix)
- [ ] `components/ui/tooltip.tsx` (shadcn/ui - Radix)
- [ ] `components/MarkdownEditor.tsx`
- [ ] `components/SlidePreview.tsx`
  - [ ] reveal.js 초기화
  - [ ] 슬라이드 렌더링
- [ ] `components/ThemeSelector.tsx`
- [ ] `components/ExportButtons.tsx`

#### Phase 6: 메인 페이지
- [ ] `app/page.tsx` 작성
  - [ ] 레이아웃 구성 (좌우 분할)
  - [ ] 컴포넌트 조합

#### Phase 7: 테스트 및 디버깅
- [ ] 마크다운 파싱 테스트
- [ ] 테마 변경 테스트
- [ ] PDF/HTML 내보내기 테스트
- [ ] 브라우저 호환성 테스트

#### Phase 8: 최적화
- [ ] Debounce 성능 확인
- [ ] 불필요한 리렌더링 제거 (React.memo)
- [ ] 번들 사이즈 최적화

---

### 11.3 Dependencies (package.json)

```json
{
  "dependencies": {
    // Core
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.2",
    "marked": "^15.0.4",
    "reveal.js": "^5.2.1",
    "dompurify": "^3.3.1",
    "@types/dompurify": "^3.0.5",
    // UI (shadcn/ui + Radix)
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "lucide-react": "^0.563.0",
    // UX (v1.1.0)
    "react-hot-toast": "^2.6.0",
    "react-joyride": "^2.9.3"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.1.18",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.18.0",
    "eslint-config-next": "^15.1.3",
    "prettier": "^3.4.2",
    // Testing (v1.1.0)
    "vitest": "^4.0.18",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "jsdom": "^28.0.0"
  }
}
```

---

## 12. Test Plan (선택 사항)

### 12.1 Test Scope

| Type | Target | Tool | Priority | Status |
|------|--------|------|----------|--------|
| Unit Test | `parseMarkdownToSlides()` | Vitest | Medium | ✅ 11 tests |
| Unit Test | `debounce()`, `cn()` | Vitest | Low | ✅ 6 tests |
| Integration Test | Store ↔ MarkdownParser | Vitest + Zustand | Medium | ✅ 4 tests |
| E2E Test | 전체 사용자 플로우 | Playwright | Low (선택) | - |

### 12.2 Key Test Cases

#### Unit Test: `parseMarkdownToSlides()`

```typescript
// lib/markdownParser.test.ts

describe('parseMarkdownToSlides', () => {
  it('should split slides by ---', () => {
    const markdown = '# Slide 1\n\n---\n\n# Slide 2'
    const slides = parseMarkdownToSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0].content).toBe('# Slide 1')
    expect(slides[1].content).toBe('# Slide 2')
  })

  it('should handle vertical slides (-----)', () => {
    const markdown = '# Slide 1\n\n-----\n\n# Slide 1.1'
    const slides = parseMarkdownToSlides(markdown)

    expect(slides[0].type).toBe('horizontal')
    expect(slides[1].type).toBe('vertical')
  })
})
```

---

## 13. Performance Optimization

### 13.1 Optimization Strategies

| Strategy | Implementation | Impact |
|----------|----------------|--------|
| **Debounce** | 300ms delay on parse (store는 즉시) | 파싱 횟수 80% 감소 |
| **Lazy Load** | reveal.js `dynamic import()` | 초기 번들 사이즈 감소 |
| **Code Splitting** | Next.js 자동 분할 | 페이지별 최적화 |
| **Zustand Selector** | Store selector 패턴으로 선택적 리렌더링 | React.memo 불필요 |

### 13.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| 마크다운 파싱 | < 100ms (1000줄) | Chrome DevTools |
| 미리보기 렌더링 | < 200ms | Debounce 후 측정 |
| 초기 로딩 | < 2s | Lighthouse |
| 번들 사이즈 | < 500KB (gzip) | Next.js Bundle Analyzer |

---

## 14. Future Enhancements (향후 개선 사항)

이 설계는 Starter 레벨 MVP입니다. 향후 개선 가능한 기능:

- [ ] **로컬 스토리지 저장**: IndexedDB로 마크다운 자동 저장
- [ ] **다크 모드**: 에디터 UI 다크 모드 지원
- [ ] **파일 업로드**: Drag & Drop으로 `.md` 파일 로드
- [ ] **단축키**: Ctrl+S 저장, Ctrl+E 내보내기 등
- [ ] **미리보기 동기화**: 에디터 스크롤 ↔ 슬라이드 동기화
- [ ] **Fragment 지원**: reveal.js Fragment 문법 파싱
- [ ] **커스텀 CSS**: 사용자 정의 CSS 업로드
- [ ] **Speaker Notes UI**: 발표자 노트 편집 UI

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-04 | Initial design | Claude Code |
