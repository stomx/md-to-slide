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
         ↓
    Debounce (300ms)
         │
         ↓
  Zustand Store 업데이트
         │
         ├──→ markdownParser.splitSlides()
         │         │
         │         ↓
         │    Slide[] 배열 생성
         │         │
         │         ↓
         │    reveal.js 렌더링
         │
         └──→ 테마 변경 시
                   │
                   ↓
              CSS 동적 로드
                   │
                   ↓
              reveal.js 재초기화
```

### 2.3 Component Dependencies

```
App (page.tsx)
 │
 ├─→ MarkdownEditor
 │    └─→ useSlideStore (Zustand)
 │
 ├─→ SlidePreview
 │    ├─→ useSlideStore (Zustand)
 │    ├─→ markdownParser (lib)
 │    └─→ reveal.js (public)
 │
 ├─→ ThemeSelector
 │    ├─→ useSlideStore (Zustand)
 │    └─→ themeManager (lib)
 │
 └─→ ExportButtons
      ├─→ useSlideStore (Zustand)
      └─→ exportHelper (lib)
```

---

## 3. Data Model

### 3.1 Zustand Store Structure

```typescript
// store/slide-store.ts

interface SlideStore {
  // State
  markdown: string                    // 사용자 입력 마크다운
  selectedTheme: string               // 현재 테마 이름
  isDirty: boolean                    // 저장 안 된 변경사항 여부
  slides: Slide[]                     // 파싱된 슬라이드 배열

  // Actions
  setMarkdown: (markdown: string) => void
  setTheme: (theme: string) => void
  setSlides: (slides: Slide[]) => void
  reset: () => void
}

// 초기 상태
const initialState = {
  markdown: DEFAULT_SAMPLE_MARKDOWN,
  selectedTheme: 'black',
  isDirty: false,
  slides: []
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

export interface ExportConfig {
  format: 'pdf' | 'html'
  filename: string
  includeNotes?: boolean              // PDF 전용
  separateFragments?: boolean         // PDF 전용
  embedAssets?: boolean               // HTML 전용
  revealJsMode?: 'cdn' | 'local'      // HTML 전용
}
```

### 3.3 Constants (상수 정의)

```typescript
// constants/separators.ts
export const HORIZONTAL_SEPARATOR = /^\r?\n---\r?\n$/
export const VERTICAL_SEPARATOR = /^\r?\n-----\r?\n$/
export const NOTES_SEPARATOR = /^notes?:/i

// constants/themes.ts
export const DEFAULT_THEMES: Theme[] = [
  { name: 'black', displayName: 'Black', builtIn: true, cssUrl: '/reveal.js/dist/theme/black.css' },
  { name: 'white', displayName: 'White', builtIn: true, cssUrl: '/reveal.js/dist/theme/white.css' },
  { name: 'league', displayName: 'League', builtIn: true, cssUrl: '/reveal.js/dist/theme/league.css' },
  // ... 12개 테마
]

// constants/defaults.ts
export const DEFAULT_THEME = 'black'
export const DEBOUNCE_DELAY = 300
export const DEFAULT_SAMPLE_MARKDOWN = `# Welcome to md-to-slide

---

## Slide 2
...`
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
| `Button` | `components/ui/Button.tsx` | 재사용 버튼 | `onClick`, `variant` |
| `Select` | `components/ui/Select.tsx` | 재사용 드롭다운 | `value`, `onChange`, `options` |
| `Textarea` | `components/ui/Textarea.tsx` | 재사용 텍스트 영역 | `value`, `onChange` |

### 4.2 MarkdownEditor Component

```typescript
// components/MarkdownEditor.tsx

import { useSlideStore } from '@/store/slide-store'
import { Textarea } from '@/components/ui/Textarea'
import { debounce } from '@/lib/utils'

export function MarkdownEditor() {
  const { markdown, setMarkdown } = useSlideStore()

  // Debounce 적용 (300ms)
  const debouncedSetMarkdown = debounce(setMarkdown, 300)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    debouncedSetMarkdown(e.target.value)
  }

  return (
    <div className="editor-container">
      <Textarea
        value={markdown}
        onChange={handleChange}
        placeholder="# Slide 1\n\n---\n\n# Slide 2"
        className="markdown-editor"
      />
    </div>
  )
}
```

**Props**: 없음 (Zustand store 사용)

**State**: 없음 (전역 상태 사용)

**Responsibilities**:
- 마크다운 입력 받기
- Debounce 적용하여 store 업데이트
- 스크롤 동기화 (선택 사항)

---

### 4.3 SlidePreview Component

```typescript
// components/SlidePreview.tsx

import { useEffect, useRef } from 'react'
import { useSlideStore } from '@/store/slide-store'
import { parseMarkdownToSlides } from '@/lib/markdownParser'
import Reveal from 'reveal.js'

export function SlidePreview() {
  const { markdown, selectedTheme } = useSlideStore()
  const revealRef = useRef<HTMLDivElement>(null)
  const revealInstance = useRef<Reveal | null>(null)

  // reveal.js 초기화
  useEffect(() => {
    if (!revealRef.current) return

    revealInstance.current = new Reveal(revealRef.current, {
      controls: true,
      progress: true,
      center: true,
      hash: true,
      transition: 'slide'
    })

    revealInstance.current.initialize()

    return () => {
      revealInstance.current?.destroy()
    }
  }, [])

  // 마크다운 변경 시 슬라이드 재렌더링
  useEffect(() => {
    const slides = parseMarkdownToSlides(markdown)

    if (revealInstance.current) {
      revealInstance.current.sync()  // 슬라이드 동기화
    }
  }, [markdown])

  // 테마 변경 시 CSS 로드
  useEffect(() => {
    const theme = THEMES.find(t => t.name === selectedTheme)
    if (!theme) return

    // 기존 테마 CSS 제거
    const oldLink = document.querySelector('#reveal-theme')
    if (oldLink) oldLink.remove()

    // 새 테마 CSS 추가
    const link = document.createElement('link')
    link.id = 'reveal-theme'
    link.rel = 'stylesheet'
    link.href = theme.cssUrl
    document.head.appendChild(link)
  }, [selectedTheme])

  const slides = parseMarkdownToSlides(markdown)

  return (
    <div className="reveal" ref={revealRef}>
      <div className="slides">
        {slides.map(slide => (
          <section
            key={slide.id}
            data-markdown=""
            data-separator="---"
            data-separator-vertical="-----"
          >
            <div dangerouslySetInnerHTML={{ __html: slide.html }} />
          </section>
        ))}
      </div>
    </div>
  )
}
```

**Props**: 없음

**Refs**: `revealRef` (reveal.js DOM), `revealInstance` (reveal.js API)

**Responsibilities**:
- reveal.js 초기화 및 라이프사이클 관리
- 마크다운 변경 감지 및 슬라이드 재렌더링
- 테마 변경 시 CSS 동적 로드

---

### 4.4 ThemeSelector Component

```typescript
// components/ThemeSelector.tsx

import { useSlideStore } from '@/store/slide-store'
import { Select } from '@/components/ui/Select'
import { THEMES } from '@/constants/themes'

export function ThemeSelector() {
  const { selectedTheme, setTheme } = useSlideStore()

  const options = THEMES.map(theme => ({
    value: theme.name,
    label: theme.displayName
  }))

  return (
    <div className="theme-selector">
      <label htmlFor="theme-select">Theme:</label>
      <Select
        id="theme-select"
        value={selectedTheme}
        onChange={setTheme}
        options={options}
      />
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
// components/ExportButtons.tsx

import { useSlideStore } from '@/store/slide-store'
import { exportToPDF, exportToHTML } from '@/lib/exportHelper'
import { Button } from '@/components/ui/Button'

export function ExportButtons() {
  const { markdown, selectedTheme } = useSlideStore()

  const handleExportPDF = async () => {
    try {
      await exportToPDF({ format: 'pdf', filename: 'presentation.pdf' })
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF 내보내기에 실패했습니다.')
    }
  }

  const handleExportHTML = async () => {
    try {
      await exportToHTML({
        format: 'html',
        filename: 'presentation.html',
        embedAssets: true,
        revealJsMode: 'local'
      })
    } catch (error) {
      console.error('HTML export failed:', error)
      alert('HTML 내보내기에 실패했습니다.')
    }
  }

  return (
    <div className="export-buttons">
      <Button onClick={handleExportPDF} variant="outline">
        Export to PDF
      </Button>
      <Button onClick={handleExportHTML} variant="default">
        Export to HTML
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
import type { Slide } from '@/types/slide.types'
import { HORIZONTAL_SEPARATOR, VERTICAL_SEPARATOR } from '@/constants/separators'

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
      const slide: Slide = {
        id: `slide-${hIndex}-${vIndex}`,
        content: content.trim(),
        html: marked(content.trim()),  // marked.js로 HTML 변환
        order: globalOrder++,
        type: vIndex === 0 ? 'horizontal' : 'vertical',
        sectionId: `section-${hIndex}`
      }

      slides.push(slide)
    })
  })

  return slides
}

/**
 * Debounce 유틸리티
 * @param func - 디바운스할 함수
 * @param delay - 지연 시간 (ms)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
```

**시간 복잡도**: O(n) (n = 마크다운 길이)

**성능 목표**: 1000줄 마크다운을 100ms 이내 파싱

---

### 5.2 Theme Application Algorithm

```typescript
// lib/themeManager.ts

import type { Theme } from '@/types/slide.types'

/**
 * 테마 CSS를 동적으로 로드
 * @param theme - 적용할 테마 객체
 */
export function applyTheme(theme: Theme): void {
  // 1. 기존 테마 CSS 제거
  const oldLink = document.querySelector('#reveal-theme')
  if (oldLink) {
    oldLink.remove()
  }

  // 2. 새 테마 CSS 추가
  const link = document.createElement('link')
  link.id = 'reveal-theme'
  link.rel = 'stylesheet'
  link.href = theme.cssUrl
  document.head.appendChild(link)

  // 3. CSS Variables 오버라이드 (선택 사항)
  if (theme.cssVariables) {
    const root = document.documentElement
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }
}
```

---

### 5.3 Export Algorithm

#### 5.3.1 PDF Export

```typescript
// lib/exportHelper.ts

/**
 * PDF로 내보내기 (브라우저 인쇄 API 사용)
 * @param config - PDF 내보내기 설정
 */
export async function exportToPDF(config: ExportConfig): Promise<void> {
  // 1. URL에 ?print-pdf 파라미터 추가
  const printUrl = `${window.location.origin}${window.location.pathname}?print-pdf`

  // 2. 새 창 열기
  const printWindow = window.open(printUrl, '_blank')

  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups.')
  }

  // 3. 인쇄 대화상자 열기 (자동)
  printWindow.onload = () => {
    printWindow.print()
  }
}
```

#### 5.3.2 HTML Export

```typescript
/**
 * HTML 파일로 내보내기 (reveal.js 포함)
 * @param config - HTML 내보내기 설정
 */
export async function exportToHTML(config: ExportConfig): Promise<void> {
  const { markdown, selectedTheme } = useSlideStore.getState()
  const slides = parseMarkdownToSlides(markdown)

  // 1. HTML 템플릿 생성
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Presentation</title>
  <link rel="stylesheet" href="reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="reveal.js/dist/theme/${selectedTheme}.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slides.map(slide => `
        <section>
          ${slide.html}
        </section>
      `).join('\n')}
    </div>
  </div>

  <script src="reveal.js/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      controls: true,
      progress: true,
      center: true,
      hash: true
    })
  </script>
</body>
</html>
  `

  // 2. Blob 생성 및 다운로드
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = config.filename
  a.click()

  // 3. Cleanup
  URL.revokeObjectURL(url)
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

### 6.3 Responsive Design (선택 사항)

- **Desktop** (>= 1024px): 좌우 분할 (50:50)
- **Tablet** (768px ~ 1023px): 좌우 분할 (40:60)
- **Mobile** (< 768px): 세로 배치 (에디터 위, 미리보기 아래)

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
// components/SlidePreview.tsx

try {
  const slides = parseMarkdownToSlides(markdown)
  setSlides(slides)
} catch (error) {
  console.error('Markdown parsing failed:', error)

  // Fallback: 에러 슬라이드 표시
  setSlides([{
    id: 'error-slide',
    content: '# Parsing Error\n\nPlease check your markdown syntax.',
    html: '<h1>Parsing Error</h1><p>Please check your markdown syntax.</p>',
    order: 0,
    type: 'horizontal'
  }])
}
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
| `parseMarkdownToSlides()` | Application | `src/lib/markdownParser.ts` |
| `applyTheme()` | Application | `src/lib/themeManager.ts` |
| `exportToPDF()` | Application | `src/lib/exportHelper.ts` |
| `useSlideStore` | Application | `src/store/slide-store.ts` |
| `Slide` type | Domain | `src/types/slide.types.ts` |
| `THEMES` | Domain | `src/constants/themes.ts` |

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
| Files (utility) | camelCase.ts | `markdownParser.ts`, `exportHelper.ts` |
| Folders | kebab-case | `markdown-editor/` |

### 10.2 Import Order (Example)

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. External libraries
import { marked } from 'marked'
import { create } from 'zustand'

// 3. Internal modules
import { Button } from '@/components/ui/Button'
import { parseMarkdownToSlides } from '@/lib/markdownParser'
import { useSlideStore } from '@/store/slide-store'

// 4. Types
import type { Slide, Theme } from '@/types/slide.types'

// 5. Styles
import './styles.css'
```

### 10.3 Environment Variables

| Variable | Purpose | Exposed | Value |
|----------|---------|:-------:|-------|
| `NEXT_PUBLIC_APP_URL` | 앱 URL | ✅ | `http://localhost:3000` |
| `NEXT_PUBLIC_REVEAL_CDN` | reveal.js CDN (Fallback) | ✅ | `https://cdn.jsdelivr.net/npm/reveal.js@5.0.4` |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/
│   ├── page.tsx                    # 메인 페이지
│   ├── layout.tsx                  # 레이아웃
│   └── globals.css                 # Tailwind CSS
├── components/
│   ├── MarkdownEditor.tsx
│   ├── SlidePreview.tsx
│   ├── ThemeSelector.tsx
│   ├── ExportButtons.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Select.tsx
│       └── Textarea.tsx
├── lib/
│   ├── markdownParser.ts           # 마크다운 → Slide[] 변환
│   ├── themeManager.ts             # 테마 적용 로직
│   ├── exportHelper.ts             # PDF/HTML 내보내기
│   └── utils.ts                    # debounce 등
├── types/
│   └── slide.types.ts              # Slide, Theme, ExportConfig 타입
├── store/
│   └── slide-store.ts              # Zustand 전역 상태
├── constants/
│   ├── themes.ts                   # 12개 테마 정의
│   ├── separators.ts               # 마크다운 구분자 정규식
│   └── defaults.ts                 # 기본값
└── public/
    └── reveal.js/                  # reveal.js 라이브러리 (로컬)
```

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
- [ ] `components/ui/Button.tsx` (재사용)
- [ ] `components/ui/Select.tsx` (재사용)
- [ ] `components/ui/Textarea.tsx` (재사용)
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
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "marked": "^15.0.0",
    "reveal.js": "^5.0.4"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 12. Test Plan (선택 사항)

### 12.1 Test Scope

| Type | Target | Tool | Priority |
|------|--------|------|----------|
| Unit Test | `parseMarkdownToSlides()` | Jest/Vitest | Medium |
| Unit Test | `debounce()` | Jest/Vitest | Low |
| Integration Test | MarkdownEditor ↔ Store | Testing Library | Medium |
| E2E Test | 전체 사용자 플로우 | Playwright | Low (선택) |

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
| **Debounce** | 300ms delay on markdown input | 렌더링 횟수 80% 감소 |
| **React.memo** | Memoize SlidePreview | 불필요한 리렌더링 방지 |
| **Lazy Load** | reveal.js 동적 import | 초기 번들 사이즈 감소 |
| **Code Splitting** | Next.js 자동 분할 | 페이지별 최적화 |

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
