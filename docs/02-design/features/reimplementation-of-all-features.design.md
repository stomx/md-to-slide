# Design: reimplementation-of-all-features (기능 재연결 및 복원)

> **Version**: v0.5.0
> **Created**: 2026-02-10
> **Status**: Draft
> **PDCA Phase**: Design
> **Plan Reference**: `docs/01-plan/features/reimplementation-of-all-features.plan.md`

---

## 1. 아키텍처 개요

### 1.1 변경 범위

기존 디자인(v0.4.0 migration-ui) 유지. UI 레이아웃/스타일 변경 없음.
기능 연결 및 이벤트 핸들러 추가만 수행.

```
변경 대상 컴포넌트 트리:
src/app/page.tsx (Home)
├── <header>
│   ├── [수정] Present 버튼 → onClick 추가
│   └── [수정] Share 버튼 → Export 드롭다운으로 변경
│
├── <main>
│   ├── EditorPanel
│   │   ├── [수정] ModeSwitcher → AI 모드 시 openWizard() 호출
│   │   ├── MarkdownEditor (변경 없음)
│   │   ├── [수정] AIWizardPanel → isOpen 게이트 제거
│   │   └── [수정] EditorActionBar → Settings에 ThemeSelector 연동
│   │
│   └── PreviewPanel
│       ├── FloatingToolbar (변경 없음, placeholder 유지)
│       ├── SlideCanvas (변경 없음)
│       ├── [수정] BottomNavigationBar → viewMode 비활성화 표시
│       └── [수정] ThumbnailStrip → Add Slide onClick 추가
│
└── [수정] slide-store.ts → documentTitle localStorage 영속화
```

---

## 2. 상세 설계

### 2.1 [A-1] Theme Selector 재연결

**수정 파일**: `src/components/EditorActionBar.tsx`

**설계**: Settings(tune) 버튼 클릭 시 ThemeSelector 팝오버 표시

```tsx
// EditorActionBar.tsx 변경
import { useState } from 'react'
import { ThemeSelector } from './ThemeSelector'

export function EditorActionBar() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="p-4 border-t border-gray-800 bg-sidebar-darker flex flex-col gap-3">
      {/* Settings Panel (토글) */}
      {showSettings && (
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
          <ThemeSelector />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button className="flex-1 ...">Add Media</button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`... ${showSettings ? 'bg-primary text-white' : 'bg-gray-800 text-white'}`}
          title="Slide Settings"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </div>
    </div>
  )
}
```

**ThemeSelector 스타일 수정**: 다크 사이드바 환경에 맞게 스타일 변경 필요

```tsx
// ThemeSelector.tsx 변경 사항
// label: text-gray-700 → text-gray-400
// SelectTrigger: bg-white → bg-gray-700 text-gray-200 border-gray-600
// SelectContent: bg-white → bg-gray-800
// SelectItem: text-gray-900 → text-gray-200
```

**검증 기준**: Settings 버튼 클릭 → ThemeSelector 표시 → 테마 선택 → 슬라이드 스타일 변경

---

### 2.2 [A-2] AI Wizard 연동 복원

**수정 파일**: `src/components/ai-wizard/AIWizardPanel.tsx`, `src/components/ModeSwitcher.tsx`

**설계**: `isOpen` 게이트를 제거하고, EditorPanel의 `editorMode` 조건부 렌더링에만 의존

**방법**: AIWizardPanel에서 `isOpen` 관련 로직 제거 (가장 깔끔한 접근)

```tsx
// AIWizardPanel.tsx 변경
export const AIWizardPanel = () => {
  const { currentStep, error, closeWizard, goToStep } = useAIWizardStore()
  // isOpen 제거 - EditorPanel의 editorMode로 가시성 제어

  return (
    <div className="h-full flex-shrink-0 bg-gray-50 overflow-hidden flex flex-col">
      {/* 기존 내부 콘텐츠 그대로 유지 */}
      {/* isOpen 조건 래핑 제거 */}
      <div className="flex h-full flex-col">
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-sm font-bold text-gray-800">AI 슬라이드 생성</h2>
          <button onClick={() => {
            closeWizard()
            // Markdown 모드로 전환
          }}>X 버튼</button>
        </div>
        {/* Step Indicator + Step Content (기존 그대로) */}
      </div>
    </div>
  )
}
```

**ModeSwitcher 변경**: AI 모드 전환 시 `openWizard()` 호출

```tsx
// ModeSwitcher.tsx 변경
import { useAIWizardStore } from '@/store/ai-wizard-store'

export function ModeSwitcher() {
  const { editorMode, setEditorMode } = useSlideStore()
  const { openWizard } = useAIWizardStore()

  const handleModeChange = (mode: 'markdown' | 'ai') => {
    setEditorMode(mode)
    if (mode === 'ai') {
      openWizard()
    }
  }
  // onChange에서 handleModeChange 호출
}
```

**AIWizardPanel 닫기 → Markdown 모드 복귀**: X 버튼 클릭 시 editorMode를 'markdown'으로 전환

```tsx
// AIWizardPanel.tsx - X 버튼 핸들러
const { setEditorMode } = useSlideStore()

const handleClose = () => {
  closeWizard()
  setEditorMode('markdown')
}
```

**검증 기준**: ModeSwitcher AI 탭 → AI Wizard 표시 → 4단계 위저드 동작 → X 닫기 → Markdown 모드 복귀

---

### 2.3 [A-3] Export 기능 재연결

**수정 파일**: `src/app/page.tsx`

**설계**: Header의 "Share" 버튼 영역을 Export 드롭다운으로 변경

```tsx
// page.tsx - Header 우측 수정
import { useState, useRef, useEffect } from 'react'
import { exportToPDF, exportToHTML } from '@/lib/exportHelper'
import { showToast } from '@/components/Toast'

// Header 우측 영역
<div className="flex items-center gap-3">
  {/* Export 드롭다운 */}
  <ExportDropdown />

  {/* Present 버튼 (B-1에서 onClick 추가) */}
  <button onClick={handlePresent} className="...">
    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
    Present
  </button>

  {/* Profile */}
  <div className="w-8 h-8 rounded-full ...">U</div>
</div>
```

**ExportDropdown 컴포넌트** (page.tsx 내 인라인):

```tsx
function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { selectedTheme } = useSlideStore()

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExportPDF = () => {
    exportToPDF({ format: 'pdf', includeNotes: false, theme: selectedTheme })
    setIsOpen(false)
  }

  const handleExportHTML = () => {
    exportToHTML({ format: 'html', includeNotes: false, theme: selectedTheme }, 'presentation.html')
    setIsOpen(false)
  }

  const handleExportPptx = async () => {
    try {
      const revealContainer = document.querySelector('.reveal') as HTMLElement
      if (!revealContainer) { showToast.error('슬라이드 프리뷰를 찾을 수 없습니다.'); return }
      const { exportToPptx } = await import('@/lib/export/pptxExporter')
      await exportToPptx(revealContainer, { theme: selectedTheme, includeNotes: false })
      showToast.success('PPTX 내보내기 완료!')
    } catch { showToast.error('PPTX 내보내기에 실패했습니다.') }
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <span className="material-symbols-outlined text-[18px]">ios_share</span>
        Export
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <DropdownItem icon="picture_as_pdf" label="Export PDF" onClick={handleExportPDF} />
          <DropdownItem icon="code" label="Export HTML" onClick={handleExportHTML} />
          <DropdownItem icon="slideshow" label="Export PPTX" onClick={handleExportPptx} />
        </div>
      )}
    </div>
  )
}

function DropdownItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
      <span className="material-symbols-outlined text-[18px] text-gray-500">{icon}</span>
      {label}
    </button>
  )
}
```

**검증 기준**: Export 버튼 클릭 → 드롭다운 표시 → PDF/HTML/PPTX 각각 동작

---

### 2.4 [B-1] Present Mode 구현

**수정 파일**: `src/app/page.tsx`

**설계**: Fullscreen API 사용 (간단하고 안정적)

```tsx
// page.tsx - Present 버튼 핸들러
const handlePresent = () => {
  const revealContainer = document.querySelector('.reveal')
  if (revealContainer) {
    revealContainer.requestFullscreen().catch(() => {
      // fallback: 새 탭에서 열기
      showToast.error('전체화면을 지원하지 않는 브라우저입니다.')
    })
  }
}

// Header의 Present 버튼에 onClick 연결
<button onClick={handlePresent} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors">
  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
  Present
</button>
```

**검증 기준**: Present 클릭 → 전체화면 슬라이드 프리뷰 → ESC로 복귀

---

### 2.5 [C-1] Document Title 영속화

**수정 파일**: `src/store/slide-store.ts`

**설계**: `hasSeenOnboarding`과 동일한 패턴으로 localStorage 연동

```typescript
// slide-store.ts 변경

// Initial state
documentTitle: typeof window !== 'undefined'
  ? localStorage.getItem('documentTitle') || 'Untitled Presentation'
  : 'Untitled Presentation',

// Action
setDocumentTitle: (title: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('documentTitle', title)
  }
  set(() => ({ documentTitle: title }))
},
```

**검증 기준**: 제목 수정 → 새로고침 → 동일 제목 유지

---

### 2.6 [C-2] BottomNavigationBar 보완

**수정 파일**: `src/components/BottomNavigationBar.tsx`

**설계**: 미구현 기능(viewMode, zoom) 시각적 비활성화

```tsx
// BottomNavigationBar.tsx 변경

// 좌측: 뷰 토글 - 비활성화 표시 + 툴팁
<div className="flex items-center gap-2 opacity-50 cursor-not-allowed" title="Coming soon">
  <ViewToggleButton icon="grid_view" active={viewMode === 'grid'} onClick={() => {}} disabled />
  <ViewToggleButton icon="view_sidebar" active={viewMode === 'filmstrip'} onClick={() => {}} disabled />
</div>

// 우측: 줌 - 비활성화 표시
<div className="flex items-center gap-3 w-[100px] justify-end opacity-50 cursor-not-allowed" title="Coming soon">
  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Fit</span>
</div>
```

**ViewToggleButton에 disabled prop 추가**:

```tsx
function ViewToggleButton({ icon, active, onClick, disabled }: {
  icon: string; active: boolean; onClick: () => void; disabled?: boolean
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        active ? 'bg-gray-200 text-gray-900' : 'text-gray-400'
      } ${disabled ? 'cursor-not-allowed' : 'hover:text-gray-600 hover:bg-gray-100'}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}
```

**검증 기준**: viewMode/zoom 버튼이 비활성 스타일로 표시, 클릭 불가

---

### 2.7 [C-3] ThumbnailStrip Add Slide 버튼

**수정 파일**: `src/components/ThumbnailStrip.tsx`

**설계**: "+" 버튼 클릭 시 마크다운 끝에 새 슬라이드 섹션 추가

```tsx
// ThumbnailStrip.tsx 변경
const { slides, currentSlideIndex, setCurrentSlideIndex, markdown, setMarkdown } = useSlideStore()

const handleAddSlide = () => {
  const newSlideMarkdown = '\n\n---\n\n## New Slide\n\nContent here...'
  setMarkdown(markdown + newSlideMarkdown)
  // 새 슬라이드로 이동 (다음 렌더 사이클에서 slides 업데이트 후)
  setTimeout(() => {
    setCurrentSlideIndex(slides.length)
  }, 100)
}

// Add New Slide 버튼에 onClick 연결
<button
  onClick={handleAddSlide}
  className="size-8 mt-2 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors"
>
  <span className="material-symbols-outlined text-lg">add</span>
</button>
```

**검증 기준**: + 클릭 → 마크다운에 새 섹션 추가 → 슬라이드 수 증가 → 새 슬라이드로 이동

---

## 3. 구현 순서

| 순서 | 작업 ID | 파일 | 의존성 |
|------|---------|------|--------|
| 1 | C-1 | `slide-store.ts` | 없음 |
| 2 | A-1 | `ThemeSelector.tsx`, `EditorActionBar.tsx` | 없음 |
| 3 | A-2 | `AIWizardPanel.tsx`, `ModeSwitcher.tsx` | 없음 |
| 4 | A-3 | `page.tsx` | 없음 |
| 5 | B-1 | `page.tsx` | A-3과 동시 (같은 파일) |
| 6 | C-2 | `BottomNavigationBar.tsx` | 없음 |
| 7 | C-3 | `ThumbnailStrip.tsx` | 없음 |

**병렬 가능 그룹**:
- Group 1: C-1 + A-1 + A-2 + C-2 + C-3 (서로 다른 파일)
- Group 2: A-3 + B-1 (같은 page.tsx → 순차)

---

## 4. 검증 기준 종합

| # | 검증 항목 | 방법 | 합격 기준 |
|---|----------|------|----------|
| 1 | Theme Selector | Settings 클릭 → 테마 변경 | 슬라이드 스타일 변경 확인 |
| 2 | AI Wizard | AI 탭 → 위저드 표시 | 4단계 위저드 UI 표시 및 동작 |
| 3 | Export PDF | Export → PDF | 파일 다운로드 |
| 4 | Export HTML | Export → HTML | 파일 다운로드 |
| 5 | Export PPTX | Export → PPTX | 파일 다운로드 |
| 6 | Present Mode | Present 클릭 | 전체화면 진입/ESC 복귀 |
| 7 | Document Title | 제목 수정 → 새로고침 | 동일 제목 유지 |
| 8 | BottomNav 비활성 | viewMode/zoom 확인 | 비활성 스타일, 클릭 불가 |
| 9 | Add Slide | + 버튼 클릭 | 새 슬라이드 추가 + 이동 |
| 10 | 기존 기능 보존 | 마크다운 편집 + 네비게이션 | 정상 동작 |

---

## 5. 수정 파일 목록

| # | 파일 | 변경 유형 | 작업 ID |
|---|------|----------|---------|
| 1 | `src/store/slide-store.ts` | 수정 (documentTitle 영속화) | C-1 |
| 2 | `src/components/ThemeSelector.tsx` | 수정 (다크 테마 스타일) | A-1 |
| 3 | `src/components/EditorActionBar.tsx` | 수정 (Settings 토글 + ThemeSelector) | A-1 |
| 4 | `src/components/ai-wizard/AIWizardPanel.tsx` | 수정 (isOpen 게이트 제거) | A-2 |
| 5 | `src/components/ModeSwitcher.tsx` | 수정 (openWizard 호출) | A-2 |
| 6 | `src/app/page.tsx` | 수정 (ExportDropdown + Present) | A-3, B-1 |
| 7 | `src/components/BottomNavigationBar.tsx` | 수정 (비활성화 표시) | C-2 |
| 8 | `src/components/ThumbnailStrip.tsx` | 수정 (Add Slide onClick) | C-3 |

**총 8개 파일 수정, 신규 파일 0개**
