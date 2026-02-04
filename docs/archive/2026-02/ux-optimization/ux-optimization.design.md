# ux-optimization Design Document

> **Summary**: UX 최적화 기술 설계 - 로딩, 에러 처리, 접근성, 반응형, 키보드 단축키
>
> **Project**: md-to-slide
> **Version**: 1.1.0
> **Author**: Claude Code
> **Date**: 2026-02-04
> **Status**: Draft
> **Planning Doc**: [ux-optimization.plan.md](../../01-plan/features/ux-optimization.plan.md)
> **Base Design**: [md-to-slide-core.design.md](../../../docs/archive/2026-02/md-to-slide-core/md-to-slide-core.design.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | [Schema Definition](../../01-plan/schema.md) | ✅ (extends v1.0.0) |
| Phase 2 | [Coding Conventions](../../01-plan/conventions.md) | ✅ (extends v1.0.0) |
| Phase 3 | Mockup | N/A (UX enhancements only) |
| Phase 4 | API Spec | N/A (Starter - No backend) |

---

## 1. Overview

### 1.1 Design Goals

이 설계는 v1.0.0의 핵심 아키텍처를 유지하면서 UX 레이어를 추가합니다:

1. **투명성 (Transparency)**: 모든 비동기 작업의 상태를 사용자에게 명확히 표시
2. **회복성 (Resilience)**: 에러 발생 시 사용자가 쉽게 복구할 수 있는 경로 제공
3. **접근성 (Accessibility)**: WCAG 2.1 AA 준수로 모든 사용자가 앱 사용 가능
4. **적응성 (Adaptability)**: 모든 디바이스에서 최적화된 레이아웃 제공
5. **학습 용이성 (Learnability)**: 튜토리얼과 도움말로 빠른 학습 지원

### 1.2 Design Principles

- **Progressive Enhancement**: 기본 기능 유지 + UX 레이어 점진적 추가
- **Non-Blocking Feedback**: 로딩/에러 표시가 사용자 작업 흐름 방해하지 않음
- **Graceful Degradation**: JavaScript 비활성화 시에도 기본 기능 동작
- **Accessibility First**: 접근성을 사후 추가가 아닌 설계 단계부터 고려
- **Mobile First**: 모바일 레이아웃 우선 설계 → 데스크톱 확장

---

## 2. Architecture

### 2.1 Enhanced System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       Browser (Client)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              UX Feedback Layer (NEW)                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │ │
│  │  │   Toast     │  │  Loading    │  │  Progress   │      │ │
│  │  │  System     │  │  Spinner    │  │    Bar      │      │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │ │
│  │                                                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │ │
│  │  │  Keyboard   │  │  Tooltip    │  │  Modal      │      │ │
│  │  │  Shortcuts  │  │  System     │  │  Dialogs    │      │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           ↓                                   │
│  ┌────────────────────┐      ┌────────────────────┐          │
│  │  MarkdownEditor    │      │   SlidePreview     │          │
│  │  + ARIA labels     │      │   + Loading state  │          │
│  │  + Focus trap      │      │   + Error boundary │          │
│  └─────────┬──────────┘      └─────────┬──────────┘          │
│            │                           │                     │
│            │ onChange (debounce 300ms) │                     │
│            ↓                           ↓                     │
│  ┌─────────────────────────────────────────────┐             │
│  │    Enhanced Zustand Store (NEW)             │             │
│  │  [Existing]                                 │             │
│  │  - markdown: string                         │             │
│  │  - selectedTheme: string                    │             │
│  │  - slides: Slide[]                          │             │
│  │                                             │             │
│  │  [NEW UX States]                            │             │
│  │  - isLoading: boolean                       │             │
│  │  - loadingMessage: string | null            │             │
│  │  - error: string | null                     │             │
│  │  - progress: number (0-100)                 │             │
│  │                                             │             │
│  │  [NEW UX Actions]                           │             │
│  │  - setLoading(isLoading, message?)          │             │
│  │  - setError(error)                          │             │
│  │  - setProgress(progress)                    │             │
│  └─────────┬───────────────────────────────────┘             │
│            │                                                 │
│            ↓                                                 │
│  ┌─────────────────────────────────────────────┐             │
│  │      Markdown Parser (lib/markdownParser)   │             │
│  │  + Error handling with line numbers         │             │
│  │  + Progress reporting                       │             │
│  └─────────────────────────────────────────────┘             │
│                                                              │
│  ┌────────────────────┐      ┌────────────────────┐          │
│  │  ThemeSelector     │      │  ExportButtons     │          │
│  │  + Tooltip         │      │  + Progress bar    │          │
│  │  + ARIA            │      │  + Error retry     │          │
│  └────────────────────┘      └────────────────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          Responsive Layout Manager (NEW)                 │ │
│  │  - Mobile: Single column (Editor above, Preview below)  │ │
│  │  - Tablet: Tab UI (Editor tab / Preview tab)            │ │
│  │  - Desktop: 2-column layout (existing)                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 UX State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Action Flow                          │
└─────────────────────────────────────────────────────────────┘

1. 마크다운 입력
   │
   ↓
   Debounce (300ms)
   │
   ↓
   setLoading(true, "Parsing markdown...")  ← NEW
   │
   ↓
   parseMarkdownToSlides()
   │
   ├─ Success ──→ setLoading(false)
   │              Toast.success("Slides updated")  ← NEW
   │
   └─ Error ───→ setLoading(false)
                 setError(errorMessage)  ← NEW
                 Toast.error("Parsing failed at line X")  ← NEW


2. 테마 변경
   │
   ↓
   setLoading(true, "Applying theme...")  ← NEW
   │
   ↓
   applyTheme(themeName)
   │
   ├─ Success ──→ setLoading(false)
   │              Toast.success("Theme applied")  ← NEW
   │
   └─ Error ───→ setLoading(false)
                 setError(errorMessage)  ← NEW
                 Toast.error("Theme failed to load")  ← NEW


3. PDF/HTML 내보내기
   │
   ↓
   setLoading(true, "Exporting...")  ← NEW
   setProgress(0)  ← NEW
   │
   ↓
   exportToPDF() / exportToHTML()
   │
   ├─ Progress ─→ setProgress(50)  ← NEW
   │
   ├─ Success ──→ setLoading(false)
   │              setProgress(100)  ← NEW
   │              Toast.success("Export complete")  ← NEW
   │
   └─ Error ───→ setLoading(false)
                 setError(errorMessage)  ← NEW
                 Toast.error("Export failed", {
                   action: {
                     label: "Retry",
                     onClick: () => retry()  ← NEW
                   }
                 })
```

### 2.3 Component Hierarchy (Enhanced)

```
App (page.tsx)
 │
 ├─→ ToastProvider (react-hot-toast)  ← NEW
 │
 ├─→ KeyboardShortcutProvider  ← NEW
 │    └─→ useKeyboardShortcut hook
 │
 ├─→ ResponsiveLayout  ← NEW
 │    │
 │    ├─→ [Mobile < 640px]
 │    │    ├─→ MarkdownEditor (full width, above)
 │    │    └─→ SlidePreview (full width, below)
 │    │
 │    ├─→ [Tablet 640px ~ 1024px]
 │    │    └─→ Tabs
 │    │         ├─→ Tab: Editor
 │    │         └─→ Tab: Preview
 │    │
 │    └─→ [Desktop >= 1024px]
 │         ├─→ MarkdownEditor (left 50%)
 │         └─→ SlidePreview (right 50%)
 │
 ├─→ MarkdownEditor
 │    ├─→ LoadingSpinner (overlay when parsing)  ← NEW
 │    ├─→ ErrorBoundary  ← NEW
 │    └─→ Tooltip (on hover)  ← NEW
 │
 ├─→ SlidePreview
 │    ├─→ LoadingSpinner (when rendering)  ← NEW
 │    ├─→ ErrorBoundary  ← NEW
 │    └─→ SkeletonLoader (initial load)  ← NEW
 │
 ├─→ ThemeSelector
 │    ├─→ Tooltip (theme description)  ← NEW
 │    └─→ LoadingIndicator (when applying)  ← NEW
 │
 ├─→ ExportButtons
 │    ├─→ ProgressBar (when exporting)  ← NEW
 │    └─→ Tooltip (shortcuts hint)  ← NEW
 │
 ├─→ KeyboardShortcutModal  ← NEW
 │    └─→ Dialog (shadcn/ui)
 │
 ├─→ HelpModal  ← NEW
 │    └─→ Dialog (shadcn/ui)
 │
 └─→ OnboardingTutorial  ← NEW (첫 방문 시만)
      └─→ react-joyride
```

---

## 3. Data Model Extensions

### 3.1 Enhanced Zustand Store

```typescript
// store/slide-store.ts (UPDATED)

interface SlideStore {
  // ========== Existing States (v1.0.0) ==========
  markdown: string
  selectedTheme: string
  slides: Slide[]

  // ========== NEW: UX States (v1.1.0) ==========
  isLoading: boolean                  // 로딩 중 여부
  loadingMessage: string | null       // 로딩 메시지 ("Parsing...", "Exporting...")
  error: string | null                // 에러 메시지
  progress: number                    // 진행률 (0-100)

  // ========== NEW: User Preferences (v1.1.0) ==========
  hasSeenOnboarding: boolean          // 온보딩 표시 여부
  keyboardShortcutsEnabled: boolean   // 키보드 단축키 활성화

  // ========== Existing Actions (v1.0.0) ==========
  setMarkdown: (markdown: string) => void
  setSelectedTheme: (theme: string) => void
  setSlides: (slides: Slide[]) => void
  reset: () => void

  // ========== NEW: UX Actions (v1.1.0) ==========
  setLoading: (isLoading: boolean, message?: string) => void
  setError: (error: string | null) => void
  clearError: () => void
  setProgress: (progress: number) => void
  setHasSeenOnboarding: (seen: boolean) => void
  setKeyboardShortcutsEnabled: (enabled: boolean) => void
}

// 초기 상태 (UPDATED)
const initialState = {
  // Existing
  markdown: DEFAULT_SAMPLE_MARKDOWN,
  selectedTheme: 'black',
  slides: [],

  // NEW
  isLoading: false,
  loadingMessage: null,
  error: null,
  progress: 0,
  hasSeenOnboarding: false,  // localStorage에서 읽어옴
  keyboardShortcutsEnabled: true
}
```

### 3.2 New Types

```typescript
// types/ux.types.ts (NEW FILE)

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  message: string
  type: ToastType
  duration?: number  // ms (기본 3000)
  action?: {
    label: string
    onClick: () => void
  }
}

export interface KeyboardShortcut {
  key: string                       // 'S', 'E', 'K', '?'
  modifiers: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  }
  description: string               // "Save markdown"
  action: () => void
  context?: 'global' | 'editor' | 'preview'
}

export interface OnboardingStep {
  target: string                    // CSS selector
  content: string                   // 설명 텍스트
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disableBeacon?: boolean
}

export interface ResponsiveBreakpoint {
  name: 'mobile' | 'tablet' | 'desktop'
  minWidth: number
  maxWidth: number
  layout: 'single-column' | 'tabs' | 'two-column'
}
```

---

## 4. Component Design

### 4.1 Toast System

#### Component: `Toast.tsx` (NEW)

```typescript
// components/Toast.tsx

import { toast, Toaster } from 'react-hot-toast'

export const ToastProvider = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: '#333',
        color: '#fff',
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      },
    }}
  />
)

// 사용 예시
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string, options?: { action?: { label: string; onClick: () => void } }) => {
    if (options?.action) {
      return toast.error(
        (t) => (
          <div>
            <p>{message}</p>
            <button onClick={options.action.onClick}>{options.action.label}</button>
          </div>
        )
      )
    }
    return toast.error(message)
  },
  warning: (message: string) => toast(message, { icon: '⚠️' }),
  info: (message: string) => toast(message, { icon: 'ℹ️' }),
}
```

**Usage in MarkdownEditor**:
```typescript
const handleMarkdownChange = async (newMarkdown: string) => {
  setMarkdown(newMarkdown)
  setLoading(true, "Parsing markdown...")

  try {
    const slides = await parseMarkdownToSlides(newMarkdown)
    setSlides(slides)
    showToast.success(`${slides.length} slides parsed`)
  } catch (error) {
    showToast.error(`Parsing failed: ${error.message}`)
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

---

### 4.2 Loading Components

#### Component: `LoadingSpinner.tsx` (NEW)

```typescript
// components/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  overlay?: boolean  // 전체 화면 오버레이 여부
}

export const LoadingSpinner = ({ size = 'md', message, overlay = false }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-2">
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {message && (
        <p className="text-sm text-gray-600" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
```

#### Component: `ProgressBar.tsx` (NEW)

```typescript
// components/ProgressBar.tsx

interface ProgressBarProps {
  progress: number  // 0-100
  message?: string
  showPercentage?: boolean
}

export const ProgressBar = ({ progress, message, showPercentage = true }: ProgressBarProps) => {
  return (
    <div className="w-full">
      {message && (
        <p className="text-sm text-gray-600 mb-2" role="status" aria-live="polite">
          {message}
        </p>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {showPercentage && (
        <p className="text-sm text-gray-600 mt-1 text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  )
}
```

---

### 4.3 Keyboard Shortcuts System

#### Hook: `useKeyboardShortcut.ts` (NEW)

```typescript
// hooks/useKeyboardShortcut.ts

import { useEffect } from 'react'

export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: (e: KeyboardEvent) => void
  preventDefault?: boolean
}

export const useKeyboardShortcut = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const isCtrl = !shortcut.ctrl || e.ctrlKey || e.metaKey
        const isShift = !shortcut.shift || e.shiftKey
        const isAlt = !shortcut.alt || e.altKey
        const isKey = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (isCtrl && isShift && isAlt && isKey) {
          if (shortcut.preventDefault) {
            e.preventDefault()
          }
          shortcut.callback(e)
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
```

**Usage in App**:
```typescript
// app/page.tsx

const App = () => {
  const { markdown, setMarkdown } = useSlideStore()
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  useKeyboardShortcut([
    {
      key: 's',
      ctrl: true,
      callback: () => {
        saveMarkdownToLocalStorage(markdown)
        showToast.success('Markdown saved')
      },
      preventDefault: true,
    },
    {
      key: 'e',
      ctrl: true,
      callback: () => exportToPDF(),
      preventDefault: true,
    },
    {
      key: 'e',
      ctrl: true,
      shift: true,
      callback: () => exportToHTML(),
      preventDefault: true,
    },
    {
      key: 'k',
      ctrl: true,
      callback: () => setShowShortcutsModal(true),
      preventDefault: true,
    },
    {
      key: '?',
      ctrl: true,
      callback: () => setShowHelpModal(true),
      preventDefault: true,
    },
  ])

  return (
    <>
      <ToastProvider />
      {/* ... existing components */}
      <KeyboardShortcutModal open={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </>
  )
}
```

#### Component: `KeyboardShortcutModal.tsx` (NEW)

```typescript
// components/KeyboardShortcutModal.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Shortcut {
  keys: string[]
  description: string
}

const shortcuts: Shortcut[] = [
  { keys: ['Cmd', 'S'], description: 'Save markdown to local storage' },
  { keys: ['Cmd', 'E'], description: 'Export to PDF' },
  { keys: ['Cmd', 'Shift', 'E'], description: 'Export to HTML' },
  { keys: ['Cmd', 'K'], description: 'Show keyboard shortcuts' },
  { keys: ['Cmd', '?'], description: 'Show help modal' },
  { keys: ['Esc'], description: 'Close modal' },
]

export const KeyboardShortcutModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <kbd
                    key={i}
                    className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
              <span className="text-sm text-gray-600">{shortcut.description}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

### 4.4 Responsive Layout

#### Component: `ResponsiveLayout.tsx` (NEW)

```typescript
// components/ResponsiveLayout.tsx

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const ResponsiveLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [editor, preview] = React.Children.toArray(children)

  // Mobile: Single column (Editor above, Preview below)
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {editor}
        {preview}
      </div>
    )
  }

  // Tablet: Tabs
  if (isTablet) {
    return (
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">{editor}</TabsContent>
        <TabsContent value="preview">{preview}</TabsContent>
      </Tabs>
    )
  }

  // Desktop: 2-column layout (existing)
  return (
    <div className="grid grid-cols-2 gap-4">
      {editor}
      {preview}
    </div>
  )
}
```

#### Hook: `useMediaQuery.ts` (NEW)

```typescript
// hooks/useMediaQuery.ts

import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}
```

---

### 4.5 Accessibility Enhancements

#### Enhanced MarkdownEditor (ARIA)

```typescript
// components/MarkdownEditor.tsx (UPDATED)

export const MarkdownEditor = () => {
  const { markdown, setMarkdown, isLoading, error } = useSlideStore()

  return (
    <div className="relative">
      <label htmlFor="markdown-editor" className="sr-only">
        Markdown Editor
      </label>
      <textarea
        id="markdown-editor"
        aria-label="Markdown editor"
        aria-describedby="editor-help"
        aria-invalid={!!error}
        aria-busy={isLoading}
        className="w-full h-screen p-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
      />
      <div id="editor-help" className="sr-only">
        Enter markdown text here. Use --- for horizontal slides and ----- for vertical slides.
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <LoadingSpinner size="md" message="Parsing markdown..." />
        </div>
      )}
      {error && (
        <div role="alert" aria-live="assertive" className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  )
}
```

#### Enhanced Buttons (ARIA)

```typescript
// components/ExportButtons.tsx (UPDATED)

export const ExportButtons = () => {
  const { isLoading, progress } = useSlideStore()

  return (
    <div className="flex gap-2">
      <button
        aria-label="Export to PDF (Cmd+E)"
        aria-busy={isLoading}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        onClick={handleExportToPDF}
      >
        Export PDF
      </button>
      <button
        aria-label="Export to HTML (Cmd+Shift+E)"
        aria-busy={isLoading}
        disabled={isLoading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        onClick={handleExportToHTML}
      >
        Export HTML
      </button>
      {isLoading && (
        <div className="flex-1">
          <ProgressBar progress={progress} message="Exporting..." />
        </div>
      )}
    </div>
  )
}
```

---

### 4.6 Onboarding Tutorial

#### Component: `OnboardingTutorial.tsx` (NEW)

```typescript
// components/OnboardingTutorial.tsx

import Joyride, { Step } from 'react-joyride'
import { useSlideStore } from '@/store/slide-store'

const steps: Step[] = [
  {
    target: '#markdown-editor',
    content: 'Welcome! This is the markdown editor. Write your slides using markdown syntax.',
    placement: 'right',
  },
  {
    target: '#slide-preview',
    content: 'Your slides will appear here in real-time as you type.',
    placement: 'left',
  },
  {
    target: '#theme-selector',
    content: 'Choose from 12 reveal.js themes to customize your presentation.',
    placement: 'bottom',
  },
  {
    target: '#export-buttons',
    content: 'Export your slides as PDF or standalone HTML file.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: 'Press Cmd+K to see all keyboard shortcuts. Happy presenting!',
    placement: 'center',
  },
]

export const OnboardingTutorial = () => {
  const { hasSeenOnboarding, setHasSeenOnboarding } = useSlideStore()

  return (
    <Joyride
      steps={steps}
      run={!hasSeenOnboarding}
      continuous
      showProgress
      showSkipButton
      callback={(data) => {
        if (data.status === 'finished' || data.status === 'skipped') {
          setHasSeenOnboarding(true)
        }
      }}
      styles={{
        options: {
          primaryColor: '#2563eb',
        },
      }}
    />
  )
}
```

---

## 5. Implementation Details

### 5.1 Error Handling Strategy

```typescript
// lib/errorHandler.ts (NEW)

export class MarkdownParsingError extends Error {
  lineNumber?: number

  constructor(message: string, lineNumber?: number) {
    super(message)
    this.name = 'MarkdownParsingError'
    this.lineNumber = lineNumber
  }
}

export const handleError = (error: unknown, context: string) => {
  if (error instanceof MarkdownParsingError) {
    const message = error.lineNumber
      ? `${context} failed at line ${error.lineNumber}: ${error.message}`
      : `${context} failed: ${error.message}`

    showToast.error(message, {
      action: {
        label: 'View Docs',
        onClick: () => window.open('/docs/markdown-guide', '_blank'),
      },
    })
  } else {
    showToast.error(`${context} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
```

**Usage in Parser**:
```typescript
// lib/markdownParser.ts (UPDATED)

export const parseMarkdownToSlides = (markdown: string): Slide[] => {
  const lines = markdown.split('\n')
  const slides: Slide[] = []

  try {
    lines.forEach((line, index) => {
      // ... parsing logic
      if (invalidSyntax) {
        throw new MarkdownParsingError('Invalid slide separator', index + 1)
      }
    })
    return slides
  } catch (error) {
    handleError(error, 'Markdown parsing')
    throw error
  }
}
```

---

### 5.2 Loading State Management

```typescript
// lib/loadingManager.ts (NEW)

import { useSlideStore } from '@/store/slide-store'

export const withLoading = async <T,>(
  fn: () => Promise<T>,
  message: string,
  options?: {
    showProgress?: boolean
    onProgress?: (progress: number) => void
  }
): Promise<T> => {
  const { setLoading, setProgress } = useSlideStore.getState()

  setLoading(true, message)
  if (options?.showProgress) {
    setProgress(0)
  }

  try {
    const result = await fn()

    if (options?.showProgress) {
      setProgress(100)
    }

    return result
  } catch (error) {
    throw error
  } finally {
    setLoading(false)
    if (options?.showProgress) {
      setTimeout(() => setProgress(0), 500)  // Reset after animation
    }
  }
}
```

**Usage**:
```typescript
const handleExportToPDF = () => {
  withLoading(
    () => exportToPDF(markdown),
    'Exporting to PDF...',
    {
      showProgress: true,
      onProgress: (p) => useSlideStore.getState().setProgress(p),
    }
  )
    .then(() => showToast.success('PDF export complete'))
    .catch((error) => handleError(error, 'PDF export'))
}
```

---

### 5.3 Focus Management

```typescript
// hooks/useFocusTrap.ts (NEW)

import { useEffect, useRef } from 'react'

export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    container.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleTab)
  }, [isActive])

  return containerRef
}
```

**Usage in Modal**:
```typescript
const Modal = ({ open, onClose }: ModalProps) => {
  const containerRef = useFocusTrap(open)

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {/* modal content */}
    </div>
  )
}
```

---

## 6. Testing Strategy

### 6.1 Accessibility Testing

| Test Type | Tool | Criteria |
|-----------|------|----------|
| Automated | axe DevTools | 0 violations |
| Automated | Lighthouse | Accessibility score >= 90 |
| Manual | Keyboard navigation | Tab through all interactive elements |
| Manual | Screen reader (VoiceOver) | All content readable |
| Manual | Color contrast | WCAG AA (4.5:1 for text) |

### 6.2 Responsive Testing

| Viewport | Dimensions | Expected Layout |
|----------|-----------|-----------------|
| Mobile (iPhone SE) | 375 x 667 | Single column |
| Mobile (iPhone 14 Pro) | 393 x 852 | Single column |
| Tablet (iPad Mini) | 744 x 1133 | Tabs UI |
| Tablet (iPad Pro) | 1024 x 1366 | Tabs UI |
| Desktop | 1280 x 720 | 2-column |
| Desktop (large) | 1920 x 1080 | 2-column |

### 6.3 Keyboard Shortcuts Testing

| Shortcut | Expected Behavior | Test Result |
|----------|-------------------|-------------|
| Cmd+S | Save markdown to localStorage + Toast | Pending |
| Cmd+E | Export to PDF + Progress bar | Pending |
| Cmd+Shift+E | Export to HTML + Progress bar | Pending |
| Cmd+K | Open shortcuts modal | Pending |
| Cmd+? | Open help modal | Pending |
| Esc | Close active modal | Pending |
| Tab | Focus next element | Pending |
| Shift+Tab | Focus previous element | Pending |

---

## 7. Dependencies

### 7.1 New NPM Packages

| Package | Version | Size (gzipped) | Purpose |
|---------|---------|----------------|---------|
| `react-hot-toast` | ^2.4.1 | ~15 KB | Toast notifications |
| `react-joyride` | ^2.7.0 | ~45 KB | Onboarding tutorial |
| `@radix-ui/react-tooltip` | ^1.0.7 | ~20 KB | Tooltips (shadcn/ui) |
| `@radix-ui/react-dialog` | ^1.0.5 | ~25 KB | Modals (shadcn/ui) |
| `@radix-ui/react-tabs` | ^1.0.4 | ~18 KB | Tabs (shadcn/ui) |

**Total**: ~123 KB (gzipped: ~40 KB)

**Installation**:
```bash
npm install react-hot-toast react-joyride
npx shadcn-ui@latest add tooltip dialog tabs
```

### 7.2 File Structure Changes

```
src/
├── components/
│   ├── ui/  (existing shadcn/ui)
│   │   ├── button.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── tooltip.tsx  ← NEW
│   │   ├── dialog.tsx  ← NEW
│   │   └── tabs.tsx  ← NEW
│   │
│   ├── MarkdownEditor.tsx  (UPDATED - add ARIA)
│   ├── SlidePreview.tsx  (UPDATED - add loading)
│   ├── ThemeSelector.tsx  (UPDATED - add tooltip)
│   ├── ExportButtons.tsx  (UPDATED - add progress)
│   │
│   ├── Toast.tsx  ← NEW
│   ├── LoadingSpinner.tsx  ← NEW
│   ├── ProgressBar.tsx  ← NEW
│   ├── KeyboardShortcutModal.tsx  ← NEW
│   ├── HelpModal.tsx  ← NEW
│   ├── OnboardingTutorial.tsx  ← NEW
│   └── ResponsiveLayout.tsx  ← NEW
│
├── hooks/
│   ├── useKeyboardShortcut.ts  ← NEW
│   ├── useMediaQuery.ts  ← NEW
│   └── useFocusTrap.ts  ← NEW
│
├── lib/
│   ├── markdownParser.ts  (UPDATED - error handling)
│   ├── errorHandler.ts  ← NEW
│   └── loadingManager.ts  ← NEW
│
├── store/
│   └── slide-store.ts  (UPDATED - UX states)
│
└── types/
    └── ux.types.ts  ← NEW
```

---

## 8. Migration from v1.0.0

### 8.1 Breaking Changes

**None**. This is a non-breaking enhancement. All v1.0.0 features remain unchanged.

### 8.2 Opt-in Features

- Onboarding tutorial: Only shows once (controlled by `hasSeenOnboarding` state)
- Keyboard shortcuts: Can be disabled via `keyboardShortcutsEnabled` setting
- Toast notifications: Non-blocking, auto-dismiss after 3s

### 8.3 Backward Compatibility

```typescript
// v1.0.0 code continues to work
const { markdown, setMarkdown } = useSlideStore()

// v1.1.0 adds optional UX features
const { markdown, setMarkdown, isLoading, error } = useSlideStore()
```

---

## 9. Performance Considerations

### 9.1 Bundle Size Impact

| Component | Size (gzipped) | Lazy Load? |
|-----------|----------------|------------|
| Toast system | ~15 KB | No (core UX) |
| Onboarding | ~45 KB | Yes (첫 방문 시만) |
| Modals | ~25 KB | Yes (온디맨드) |
| Responsive utilities | ~5 KB | No |

**Strategy**:
```typescript
// Lazy load onboarding
const OnboardingTutorial = lazy(() => import('@/components/OnboardingTutorial'))

// Lazy load modals
const KeyboardShortcutModal = lazy(() => import('@/components/KeyboardShortcutModal'))
```

### 9.2 Runtime Performance

- **Loading indicators**: < 100ms delay (requestAnimationFrame)
- **Toast notifications**: < 50ms render time
- **Keyboard event listeners**: Debounced to prevent spam
- **Media queries**: useEffect with cleanup to avoid memory leaks

---

## 10. Success Metrics

### 10.1 Lighthouse Scores (Target)

| Metric | v1.0.0 | v1.1.0 Target |
|--------|--------|---------------|
| Accessibility | ~75 | **90+** |
| Performance | ~85 | 85 (maintain) |
| Best Practices | ~90 | 90 (maintain) |
| SEO | ~80 | 80 (maintain) |

### 10.2 User Experience Metrics

| Metric | v1.0.0 | v1.1.0 Target |
|--------|--------|---------------|
| Time to first slide | ~5 min | **3 min** (with onboarding) |
| Error recovery rate | ~30% | **95%** (with toast + retry) |
| Keyboard-only users | 0% | **100%** |
| Mobile users | ~20% | **80%** (responsive) |

---

## 11. Approval

### 11.1 Stakeholders

| Role | Name | Approval Status |
|------|------|----------------|
| Product Owner | User | Pending |
| Developer | Claude Code | Pending |

### 11.2 Sign-off Criteria

- [ ] All FR (FR-10 ~ FR-25) 설계 완료
- [ ] Accessibility 전략 명확 (WCAG 2.1 AA)
- [ ] Responsive breakpoints 정의 (mobile/tablet/desktop)
- [ ] Keyboard shortcuts 정의 (6개)
- [ ] Dependencies 확인 (123 KB total)

---

**Last Updated**: 2026-02-04
**Status**: Ready for Implementation
