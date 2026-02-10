# Design: migration-ui (UI 디자인 마이그레이션)

> **Version**: v0.4.0
> **Created**: 2026-02-09
> **Status**: Draft
> **PDCA Phase**: Design
> **Plan Reference**: `docs/01-plan/features/migration-ui.plan.md`

---

## 1. 아키텍처 개요

### 1.1 컴포넌트 트리 (TO-BE)

```
src/app/page.tsx (Home)
├── <header> ─── AppHeader (인라인)
│   ├── Logo + "SlideCraft" 브랜딩
│   ├── DocumentTitle (편집 가능)
│   └── Share + Present 버튼 + Profile
│
├── <main> ─── flex 레이아웃
│   ├── <aside> ─── EditorPanel (30%, 다크)
│   │   ├── ModeSwitcher (Markdown | AI)
│   │   ├── SlideSourceHeader ("Slide N Source" + MD 뱃지)
│   │   ├── MarkdownEditor (다크 테마)
│   │   └── EditorActionBar (Add Media + Settings)
│   │
│   └── <section> ─── PreviewPanel (70%, 밝은)
│       ├── FloatingToolbar (Layout, Text, Colors, Animation)
│       ├── SlideCanvas (도트 패턴 배경 + 카드형 슬라이드)
│       │   └── SlidePreview (reveal.js, 기존)
│       ├── BottomNavigationBar (뷰 토글 + 네비 + 줌)
│       └── ThumbnailStrip (우측 가장자리, 64px)
│
└── AIWizardPanel (기존, editorMode='ai'일 때 에디터 영역 대체)
```

### 1.2 데이터 흐름

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ ModeSwitcher │────→│ slide-store  │────→│ EditorPanel     │
│ (토글)       │     │ editorMode   │     │ MD or AI 렌더링  │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
┌─────────────┐            │ currentSlideIndex
│ ThumbnailStrip │←────────┤
│ (클릭 이벤트)  │─────────→│
└─────────────┘            │
                           ↓
┌─────────────────┐  ┌──────────────┐
│ BottomNavBar    │──│ reveal.js    │
│ (prev/next)     │→ │ slide(h,v)   │
└─────────────────┘  └──────────────┘
```

---

## 2. 상세 컴포넌트 설계

### 2.1 layout.tsx 수정

**파일**: `src/app/layout.tsx`

변경사항:
- Google Fonts CDN 추가 (Inter, JetBrains Mono)
- Material Symbols Outlined CDN 추가
- `lang="ko"` 설정

```typescript
// 추가할 <head> 링크
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

### 2.2 globals.css 수정

**파일**: `src/app/globals.css`

추가할 CSS 변수 및 스타일:

```css
/* 신규 색상 변수 */
:root {
  --color-primary: #135bec;
  --color-bg-light: #f6f6f8;
  --color-sidebar-dark: #1a1f2c;
  --color-sidebar-darker: #131620;
}

/* 폰트 패밀리 */
body {
  font-family: 'Inter', sans-serif;
}

code, .font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Material Symbols 유틸리티 */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* 도트 패턴 배경 */
.dot-pattern-bg {
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 24px 24px;
}

/* 스크롤바 숨김 (썸네일 스트립) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### 2.3 Tailwind 설정 확장

**파일**: `tailwind.config.ts` (또는 globals.css의 @theme 블록)

Tailwind v4에서는 `globals.css`에서 `@theme` 블록으로 확장:

```css
@theme {
  --color-primary: #135bec;
  --color-background-light: #f6f6f8;
  --color-background-dark: #101622;
  --color-sidebar-dark: #1a1f2c;
  --color-sidebar-darker: #131620;
  --font-family-display: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
}
```

---

### 2.4 page.tsx (Home) 재설계

**파일**: `src/app/page.tsx`

#### 구조:

```tsx
export default function Home() {
  const { slides, selectedTheme, isDirty } = useSlideStore()
  const { isOpen } = useAIWizardStore()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light font-display text-gray-900">
      {/* Header */}
      <AppHeader />

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Editor Panel (30%) */}
        <EditorPanel />

        {/* Right: Preview Panel (70%) */}
        <PreviewPanel />
      </main>
    </div>
  )
}
```

#### AppHeader 설계 (page.tsx 내 인라인 또는 별도 컴포넌트):

```tsx
// Header 구조
<header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shrink-0 z-20">
  {/* 좌측: 로고 */}
  <div className="flex items-center gap-4">
    <span className="material-symbols-outlined text-3xl text-primary">slideshow</span>
    <h2 className="text-lg font-bold tracking-tight">SlideCraft</h2>
  </div>

  {/* 중앙: 문서 제목 */}
  <DocumentTitle />

  {/* 우측: 액션 */}
  <div className="flex items-center gap-3">
    <ShareButton />
    <PresentButton />  {/* primary 색상, play_arrow 아이콘 */}
    <ProfileAvatar />
  </div>
</header>
```

**핵심 결정**: ThemeSelector와 ExportButtons는 헤더에서 제거하고, FloatingToolbar와 Share/Present로 이동

---

### 2.5 EditorPanel 컴포넌트 (신규)

**파일**: `src/components/EditorPanel.tsx`

에디터 패널 전체를 래핑하는 컨테이너 컴포넌트.

```tsx
interface EditorPanelProps {}

export function EditorPanel() {
  const { editorMode } = useSlideStore()

  return (
    <aside className="w-[30%] min-w-[320px] max-w-[450px] bg-sidebar-dark text-gray-300 flex flex-col border-r border-gray-800 z-10 shadow-xl">
      {/* Mode Switcher */}
      <ModeSwitcher />

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {editorMode === 'markdown' ? (
          <MarkdownEditorView />
        ) : (
          <AIAssistantView />
        )}
      </div>

      {/* Bottom Actions */}
      <EditorActionBar />
    </aside>
  )
}
```

**스타일 상세**:
- 배경: `bg-[#1a1f2c]` (sidebar-dark)
- 텍스트: `text-gray-300`
- 테두리: `border-r border-gray-800`
- 그림자: `shadow-xl` (깊이감)
- 너비: `w-[30%] min-w-[320px] max-w-[450px]`

---

### 2.6 ModeSwitcher 컴포넌트 (신규)

**파일**: `src/components/ModeSwitcher.tsx`

라디오 버튼 기반 토글 스위처.

```tsx
export function ModeSwitcher() {
  const { editorMode, setEditorMode } = useSlideStore()

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="bg-[#131620] p-1 rounded-lg flex items-center justify-center">
        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            name="editor-mode"
            value="markdown"
            checked={editorMode === 'markdown'}
            onChange={() => setEditorMode('markdown')}
            className="peer sr-only"
          />
          <div className="flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-all peer-checked:bg-gray-700 peer-checked:text-white peer-checked:shadow-sm text-gray-400 hover:text-gray-200">
            <span className="material-symbols-outlined text-[18px] mr-2">code</span>
            Markdown
          </div>
        </label>
        <label className="flex-1 cursor-pointer">
          <input
            type="radio"
            name="editor-mode"
            value="ai"
            checked={editorMode === 'ai'}
            onChange={() => setEditorMode('ai')}
            className="peer sr-only"
          />
          <div className="flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-sm text-gray-400 hover:text-gray-200">
            <span className="material-symbols-outlined text-[18px] mr-2">auto_awesome</span>
            AI Assistant
          </div>
        </label>
      </div>
    </div>
  )
}
```

**동작**: `editorMode` 상태에 따라 EditorPanel 내부에서 마크다운 에디터 또는 AI 위저드 패널을 렌더링

---

### 2.7 MarkdownEditor 수정

**파일**: `src/components/MarkdownEditor.tsx`

기존 코드 수정 (다크 테마 적용):

```tsx
// 변경 전
<div className="relative flex h-full flex-col bg-white text-gray-900">
  <div className="border-b bg-gray-50 px-4 py-3">
    <h2>Markdown Editor</h2>
    ...
  </div>
  <Textarea className="... bg-white text-gray-900 border-gray-300 ..." />
</div>

// 변경 후
<div className="flex flex-col h-full">
  {/* Slide Source Header */}
  <div className="flex items-center justify-between px-4 py-2 bg-[#131620] border-b border-gray-800 text-xs uppercase tracking-wider font-semibold text-gray-500">
    <span>Slide {currentSlideIndex + 1} Source</span>
    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-mono">MD</span>
  </div>

  {/* Textarea - 다크 테마 */}
  <textarea
    value={markdown}
    onChange={handleChange}
    className="flex-1 w-full bg-[#1a1f2c] p-6 font-mono text-sm leading-relaxed text-gray-300 resize-none focus:outline-none focus:ring-0 border-none selection:bg-primary/30"
    spellCheck={false}
  />
</div>
```

**핵심 변경**:
- 배경: `bg-white` → `bg-[#1a1f2c]`
- 텍스트: `text-gray-900` → `text-gray-300`
- 폰트: 시스템 mono → `font-mono` (JetBrains Mono로 자동 매핑)
- 헤더: "Markdown Editor" → "Slide N Source" + MD 뱃지
- 도움말 텍스트 제거 (슬라이드 소스 헤더로 대체)
- Textarea 컴포넌트 → 네이티브 `<textarea>` (스타일 제어 간소화)

---

### 2.8 EditorActionBar 컴포넌트 (신규)

**파일**: `src/components/EditorActionBar.tsx`

```tsx
export function EditorActionBar() {
  return (
    <div className="p-4 border-t border-gray-800 bg-[#131620] flex items-center justify-between gap-3">
      <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-700">
        <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
        Add Media
      </button>
      <button
        className="flex items-center justify-center p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
        title="Slide Settings"
      >
        <span className="material-symbols-outlined text-[20px]">tune</span>
      </button>
    </div>
  )
}
```

---

### 2.9 PreviewPanel 컴포넌트 (신규)

**파일**: `src/components/PreviewPanel.tsx`

프리뷰 영역 전체를 래핑하는 컨테이너.

```tsx
export function PreviewPanel() {
  return (
    <section className="flex-1 bg-gray-100 relative flex flex-col h-full overflow-hidden">
      {/* Floating Toolbar (hover시 표시) */}
      <FloatingToolbar />

      {/* Slide Canvas */}
      <SlideCanvas />

      {/* Bottom Navigation */}
      <BottomNavigationBar />

      {/* Thumbnail Strip (우측 가장자리) */}
      <ThumbnailStrip />
    </section>
  )
}
```

---

### 2.10 SlideCanvas 컴포넌트 (신규)

**파일**: `src/components/SlideCanvas.tsx`

reveal.js 프리뷰를 카드형으로 래핑.

```tsx
export function SlideCanvas() {
  return (
    <div
      className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16 overflow-hidden group/canvas dot-pattern-bg"
    >
      {/* 카드형 슬라이드 */}
      <div className="aspect-video w-full max-w-5xl bg-white shadow-2xl rounded-xl overflow-hidden relative">
        <SlidePreview />
      </div>
    </div>
  )
}
```

**핵심 결정**:
- `aspect-video` (16:9) 비율 고정
- `max-w-5xl` (1024px) 최대 너비
- `shadow-2xl` + `rounded-xl`로 카드 효과
- 도트 패턴 배경은 CSS 클래스 `.dot-pattern-bg`
- reveal.js `embedded: true` 모드이므로 카드 내부에 안전하게 렌더링

**reveal.js 호환성**: 기존 SlidePreview는 `w-full h-full`로 부모 크기에 맞춰짐. 카드 내부에서 `aspect-video`로 비율이 고정되므로 reveal.js의 `width: 960, height: 700` 설정과 자연스럽게 호환

---

### 2.11 FloatingToolbar 컴포넌트 (신규)

**파일**: `src/components/FloatingToolbar.tsx`

```tsx
export function FloatingToolbar() {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md shadow-sm border border-white/50 px-4 py-2 rounded-full flex items-center gap-4 transition-all opacity-0 group-hover/canvas:opacity-100">
      <ToolbarButton icon="grid_view" title="Layout" />
      <Divider />
      <ToolbarButton icon="format_size" title="Text Style" />
      <ToolbarButton icon="palette" title="Colors" />
      <Divider />
      <ToolbarButton icon="animation" title="Animation" />
    </div>
  )
}

function ToolbarButton({ icon, title }: { icon: string; title: string }) {
  return (
    <button
      className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
      title={title}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-gray-300" />
}
```

**동작**: 프리뷰 영역 hover 시에만 표시 (`opacity-0 → group-hover/canvas:opacity-100`)

---

### 2.12 BottomNavigationBar 컴포넌트 (신규)

**파일**: `src/components/BottomNavigationBar.tsx`

```tsx
export function BottomNavigationBar() {
  const { slides, currentSlideIndex, setCurrentSlideIndex, viewMode, setViewMode } = useSlideStore()

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
      {/* 좌측: 뷰 토글 */}
      <div className="flex items-center gap-2">
        <ViewToggleButton
          icon="grid_view"
          active={viewMode === 'grid'}
          onClick={() => setViewMode('grid')}
        />
        <ViewToggleButton
          icon="view_sidebar"
          active={viewMode === 'filmstrip'}
          onClick={() => setViewMode('filmstrip')}
        />
      </div>

      {/* 중앙: 슬라이드 네비게이터 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
          disabled={currentSlideIndex === 0}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-sm font-bold text-gray-900">
          Slide {currentSlideIndex + 1}{' '}
          <span className="text-gray-400 font-normal">of {slides.length}</span>
        </span>
        <button
          onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
          disabled={currentSlideIndex >= slides.length - 1}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {/* 우측: 줌 (향후 구현) */}
      <div className="flex items-center gap-3 w-[100px] justify-end">
        <button className="text-gray-500 hover:text-gray-900 text-xs font-medium uppercase tracking-wide">
          Fit
        </button>
      </div>
    </div>
  )
}
```

**reveal.js 연동**: `setCurrentSlideIndex` 호출 시 `revealRef.current?.slide(index, 0)` 실행. 이를 위해 SlidePreview에 `useEffect`로 `currentSlideIndex` 변경 감지 → `slide()` 호출 추가.

---

### 2.13 ThumbnailStrip 컴포넌트 (신규)

**파일**: `src/components/ThumbnailStrip.tsx`

```tsx
export function ThumbnailStrip() {
  const { slides, currentSlideIndex, setCurrentSlideIndex } = useSlideStore()

  return (
    <div className="absolute top-0 right-0 bottom-16 w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-3 overflow-y-auto z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] scrollbar-hide">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => setCurrentSlideIndex(index)}
          className={`
            ${index === currentSlideIndex
              ? 'w-12 border-2 border-primary shadow-md scale-110 bg-white'
              : 'w-10 border border-gray-200 bg-gray-100 opacity-60 hover:opacity-100 hover:ring-2 hover:ring-primary/50'
            }
            aspect-video rounded cursor-pointer transition-all relative
          `}
        >
          <div className={`absolute top-0 left-0 text-white text-[8px] font-bold px-1 rounded-br ${
            index === currentSlideIndex ? 'bg-primary' : 'bg-gray-500'
          }`}>
            {index + 1}
          </div>
        </button>
      ))}

      {/* Add New Slide */}
      <button className="size-8 mt-2 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors">
        <span className="material-symbols-outlined text-lg">add</span>
      </button>
    </div>
  )
}
```

**위치**: `absolute` 포지셔닝으로 프리뷰 영역 우측 가장자리에 고정. `bottom-16`으로 BottomNavigationBar 위에 위치.

---

## 3. 상태 관리 설계

### 3.1 SlideStore 확장

**파일**: `src/types/slide.types.ts` - SlideStore 인터페이스에 추가:

```typescript
// ========== NEW: UI State (v0.4.0) ==========
currentSlideIndex: number       // 현재 선택된 슬라이드 (0-based)
viewMode: 'filmstrip' | 'grid'  // 프리뷰 영역 뷰 모드
zoomLevel: number               // 줌 레벨 (0-100), 기본값 66
editorMode: 'markdown' | 'ai'   // 에디터 모드 토글
documentTitle: string           // 문서 제목

// ========== NEW: UI Actions (v0.4.0) ==========
setCurrentSlideIndex: (index: number) => void
setViewMode: (mode: 'filmstrip' | 'grid') => void
setZoomLevel: (level: number) => void
setEditorMode: (mode: 'markdown' | 'ai') => void
setDocumentTitle: (title: string) => void
goToNextSlide: () => void
goToPrevSlide: () => void
```

**파일**: `src/store/slide-store.ts` - 구현 추가:

```typescript
// ========== NEW: UI State (v0.4.0) ==========
currentSlideIndex: 0,
viewMode: 'filmstrip',
zoomLevel: 66,
editorMode: 'markdown',
documentTitle: 'Untitled Presentation',

// ========== NEW: UI Actions (v0.4.0) ==========
setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
setViewMode: (mode) => set({ viewMode: mode }),
setZoomLevel: (level) => set({ zoomLevel: Math.min(100, Math.max(0, level)) }),
setEditorMode: (mode) => set({ editorMode: mode }),
setDocumentTitle: (title) => set({ documentTitle: title }),
goToNextSlide: () => set((state) => ({
  currentSlideIndex: Math.min(state.slides.length - 1, state.currentSlideIndex + 1)
})),
goToPrevSlide: () => set((state) => ({
  currentSlideIndex: Math.max(0, state.currentSlideIndex - 1)
})),
```

---

## 4. 삭제/교체 대상

### 4.1 제거할 컴포넌트
| 컴포넌트 | 파일 | 사유 |
|---------|------|------|
| ResponsiveLayout | `src/components/ResponsiveLayout.tsx` | page.tsx에서 직접 레이아웃 구성으로 대체 |

### 4.2 이동할 컴포넌트
| 컴포넌트 | 현재 위치 | 이동 위치 | 사유 |
|---------|----------|----------|------|
| ThemeSelector | Header | FloatingToolbar의 "Colors" 섹션 | 디자인 변경 |
| ExportButtons | Header | Share 버튼 드롭다운 메뉴 | 디자인 변경 |
| AIWizardPanel | ResponsiveLayout 세 번째 자식 | EditorPanel 내부 (editorMode='ai'일 때) | Mode Switcher 통합 |

### 4.3 아이콘 마이그레이션 맵

| 위치 | lucide-react (AS-IS) | Material Symbols (TO-BE) |
|------|---------------------|-------------------------|
| 헤더 로고 | `Presentation` | `slideshow` |
| AI 버튼 | `Sparkles` | `auto_awesome` |
| 공유 | - | `ios_share` |
| 프레젠트 | - | `play_arrow` |
| 에디터 코드 | - | `code` |
| 미디어 추가 | - | `add_photo_alternate` |
| 설정 | - | `tune` |
| 레이아웃 | - | `grid_view` |
| 텍스트 | - | `format_size` |
| 색상 | - | `palette` |
| 애니메이션 | - | `animation` |
| 네비게이션 | - | `arrow_back`, `arrow_forward` |
| 뷰 전환 | - | `view_sidebar` |
| 슬라이드 추가 | - | `add` |
| 편집 | - | `edit` |

---

## 5. 반응형 설계

### 5.1 브레이크포인트 전략

| 뷰포트 | 레이아웃 | 변경사항 |
|--------|---------|---------|
| Desktop (>= 1024px) | 30:70 수평 분할 | 기본 디자인 |
| Tablet (768-1023px) | 탭 전환 | Editor/Preview 탭, 썸네일 숨김 |
| Mobile (< 768px) | 세로 스택 | Editor → Preview 순서, 하단 네비 유지 |

### 5.2 Tablet 대응

```tsx
// Tablet: 탭 기반 전환 (기존 Tabs 컴포넌트 활용)
if (isTablet) {
  return (
    <Tabs defaultValue="preview"> {/* 프리뷰 우선 */}
      <TabsList>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="editor"><EditorPanel /></TabsContent>
      <TabsContent value="preview"><PreviewPanel /></TabsContent>
    </Tabs>
  )
}
```

### 5.3 Mobile 대응

```tsx
// Mobile: 세로 스택 (프리뷰 중심)
if (isMobile) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[40vh]"><PreviewPanel /></div>
      <div className="flex-1"><EditorPanel /></div>
    </div>
  )
}
```

---

## 6. reveal.js 연동 설계

### 6.1 슬라이드 인덱스 동기화

SlidePreview에 currentSlideIndex 변경 감지를 추가:

```typescript
// SlidePreview.tsx에 추가할 useEffect
const { currentSlideIndex } = useSlideStore()

useEffect(() => {
  if (!isReady || !revealRef.current) return
  try {
    revealRef.current.slide(currentSlideIndex, 0)
  } catch {
    // 인덱스 범위 초과 시 무시
  }
}, [currentSlideIndex, isReady])

// reveal.js → store 역방향 동기화
useEffect(() => {
  if (!isReady || !revealRef.current) return
  const handleSlideChanged = (event: { indexh: number }) => {
    setCurrentSlideIndex(event.indexh)
  }
  revealRef.current.on('slidechanged', handleSlideChanged)
  return () => revealRef.current?.off('slidechanged', handleSlideChanged)
}, [isReady, setCurrentSlideIndex])
```

### 6.2 카드형 래핑 호환성

reveal.js는 이미 `embedded: true`로 설정되어 있어, 부모 컨테이너 크기에 자동 적응. SlideCanvas의 `aspect-video` 카드 내부에서 정상 동작 예상.

추가 CSS 조정:

```css
/* SlideCanvas 내부의 reveal.js */
.slide-canvas .reveal-container {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem; /* rounded-xl */
  overflow: hidden;
}
```

---

## 7. 구현 순서

| 순서 | 파일 | 작업 | 의존성 |
|------|------|------|--------|
| 1 | `globals.css` | CSS 변수, 폰트, 유틸리티 클래스 추가 | 없음 |
| 2 | `layout.tsx` | Google Fonts CDN, Material Symbols 추가 | 없음 |
| 3 | `slide.types.ts` | UI 상태 타입 추가 | 없음 |
| 4 | `slide-store.ts` | UI 상태 및 액션 추가 | #3 |
| 5 | `ModeSwitcher.tsx` | 신규 생성 | #4 |
| 6 | `EditorActionBar.tsx` | 신규 생성 | 없음 |
| 7 | `MarkdownEditor.tsx` | 다크 테마 적용, 헤더 변경 | #4 |
| 8 | `EditorPanel.tsx` | 신규 생성 (에디터 래퍼) | #5, #6, #7 |
| 9 | `FloatingToolbar.tsx` | 신규 생성 | 없음 |
| 10 | `SlideCanvas.tsx` | 신규 생성 (카드형 래퍼) | 없음 |
| 11 | `SlidePreview.tsx` | 인덱스 동기화 추가 | #4 |
| 12 | `BottomNavigationBar.tsx` | 신규 생성 | #4 |
| 13 | `ThumbnailStrip.tsx` | 신규 생성 | #4 |
| 14 | `PreviewPanel.tsx` | 신규 생성 (프리뷰 래퍼) | #9, #10, #12, #13 |
| 15 | `page.tsx` | 전면 재설계 | #8, #14 |
| 16 | `ResponsiveLayout.tsx` | 삭제 (page.tsx에서 직접 처리) | #15 |

---

## 8. 검증 기준

| # | 검증 항목 | 방법 | 합격 기준 |
|---|----------|------|----------|
| 1 | 레이아웃 비율 | DevTools 측정 | 에디터 30%, 프리뷰 70% (±2%) |
| 2 | 다크 사이드바 | 시각적 확인 | 배경 #1a1f2c, 텍스트 gray-300 |
| 3 | Mode Switcher | 클릭 테스트 | MD/AI 토글 정상 전환 |
| 4 | 카드형 슬라이드 | 시각적 확인 | aspect-video, 그림자, 둥근 모서리 |
| 5 | 슬라이드 네비게이션 | 클릭 테스트 | 이전/다음 이동, 인덱스 표시 |
| 6 | 썸네일 스트립 | 클릭 테스트 | 클릭으로 슬라이드 이동 |
| 7 | reveal.js 동기화 | 네비/썸네일 클릭 | reveal.js 슬라이드 변경 확인 |
| 8 | 기존 기능 보존 | E2E 테스트 | 마크다운 편집, 파싱, 테마 변경 |
| 9 | 반응형 | Tablet/Mobile 시뮬 | 각 뷰포트 정상 렌더링 |
| 10 | 폰트 적용 | 시각적 확인 | Inter (본문), JetBrains Mono (에디터) |
