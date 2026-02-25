# Plan: reimplementation-of-all-features (기능 재연결 및 복원)

> **Version**: v0.5.0
> **Created**: 2026-02-10
> **Status**: Draft
> **PDCA Phase**: Plan

---

## 1. 개요

### 1.1 목표
v0.4.0 UI 마이그레이션(migration-ui)으로 레이아웃이 전면 교체되면서 **끊어지거나 미구현 상태로 남은 기존 기능들을 새 UI에 재연결**한다. 디자인 변경 없이, 기존 코드 자산을 최대한 활용하여 기능을 복원한다.

### 1.2 배경
- migration-ui(v0.4.0)에서 `ResponsiveLayout.tsx` 삭제, `page.tsx` 전면 재설계
- 기존 기능 컴포넌트(ThemeSelector, ExportButtons, AIWizardPanel)가 새 레이아웃에 연결되지 않음
- 다수의 버튼이 onClick 핸들러 없이 placeholder로만 존재
- **현재 동작하는 기능**: 마크다운 편집 → 슬라이드 프리뷰, 슬라이드 인덱스 네비게이션

### 1.3 범위
- **포함**: 기존 기능 재연결, placeholder 버튼 기능화, AI 위저드 연동 복원
- **제외**: 새 기능 추가(Share, Add Media 등은 placeholder 유지), 디자인 변경

---

## 2. 현재 상태 진단 (AS-IS)

### 2.1 기능별 현황

| # | 기능 | 파일 | 상태 | 분류 |
|---|------|------|------|------|
| 1 | Theme Selector | `ThemeSelector.tsx` | UI에서 완전 분리 (고아 컴포넌트) | **A: 재연결** |
| 2 | AI Wizard | `ai-wizard/AIWizardPanel.tsx` | 렌더링되지만 isOpen=false 게이트에 막힘 | **A: 재연결** |
| 3 | Export (PDF/HTML/PPTX) | `ExportButtons.tsx` | UI에서 완전 분리 (고아 컴포넌트) | **A: 재연결** |
| 4 | Present Mode | `page.tsx` header | onClick 없음 | **B: 신규 구현** |
| 5 | Slide Navigation | `BottomNavigationBar.tsx` | prev/next 동작, viewMode/zoom 미구현 | **C: 부분 수정** |
| 6 | Thumbnail Strip | `ThumbnailStrip.tsx` | 클릭 동작, 실제 썸네일 없음, Add 미구현 | **C: 부분 수정** |
| 7 | Document Title | `page.tsx` header | 편집 가능하지만 새로고침 시 초기화 | **C: 부분 수정** |
| 8 | FloatingToolbar | `FloatingToolbar.tsx` | 4개 버튼 모두 placeholder | **D: Placeholder 유지** |
| 9 | Share Button | `page.tsx` header | onClick 없음 | **D: Placeholder 유지** |
| 10 | Add Media / Settings | `EditorActionBar.tsx` | onClick 없음 | **D: Placeholder 유지** |

### 2.2 분류 기준

| 분류 | 설명 | 이번 작업 범위 |
|------|------|---------------|
| **A: 재연결** | 코드 존재, UI 연결만 끊어짐 | **포함** (핵심) |
| **B: 신규 구현** | 기존 인프라 위에 새 로직 필요 | **포함** (간단한 것만) |
| **C: 부분 수정** | 일부 동작, 나머지 보완 필요 | **포함** |
| **D: Placeholder 유지** | 향후 기능, 현재는 UI만 | **제외** |

---

## 3. 작업 목록 (TO-DO)

### 3.1 [A-1] Theme Selector 재연결
**난이도**: 낮음 | **예상 변경 파일**: 2개

**현재 상태**:
- `ThemeSelector.tsx`: 완전한 기능 (12개 테마, Radix Select, store 연동)
- `SlidePreview.tsx`: `selectedTheme` 변경 감지 → CSS link 업데이트 정상 동작
- 연결 끊어진 위치: 기존에는 header에 있었음

**작업 내용**:
- `FloatingToolbar.tsx`의 "Colors" 버튼에 ThemeSelector 통합
- 또는 `EditorActionBar.tsx`의 "Settings" 버튼에 테마 드롭다운 추가
- ThemeSelector import + 렌더링

**결정 필요**: 테마 선택 UI 위치
- Option A: FloatingToolbar → Colors 버튼 팝오버
- Option B: EditorActionBar → Settings 패널
- Option C: Header에 직접 복원 (가장 간단)

---

### 3.2 [A-2] AI Wizard 연동 복원
**난이도**: 중간 | **예상 변경 파일**: 2-3개

**현재 상태**:
- `AIWizardPanel.tsx`: `isOpen` 상태가 `false`일 때 `translate-x-full opacity-0 w-0` 렌더링
- `EditorPanel.tsx`: `editorMode === 'ai'`일 때 AIWizardPanel 렌더링 (조건부)
- `ModeSwitcher.tsx`: `setEditorMode('ai')` 호출하지만 `openWizard()` 미호출
- `ai-wizard-store.ts`: `openWizard()` 액션 존재 (line 59)

**작업 내용**:
- **방법 A (간단)**: ModeSwitcher에서 AI 모드 전환 시 `openWizard()` 호출 추가
- **방법 B (리팩터)**: AIWizardPanel에서 `isOpen` 게이트 제거, `editorMode`로만 제어
- EditorPanel에서 AI 모드일 때 AIWizardPanel이 정상 표시되도록 보장
- AI 모드 → Markdown 모드 전환 시 `closeWizard()` 호출

**의존성**: ai-wizard-store.ts, EditorPanel.tsx, ModeSwitcher.tsx

---

### 3.3 [A-3] Export 기능 재연결
**난이도**: 낮음 | **예상 변경 파일**: 2-3개

**현재 상태**:
- `ExportButtons.tsx`: PDF/HTML/PPTX 내보내기 핸들러 완비
- `exportHelper.ts`, `pptxExporter.ts`: 내보내기 로직 정상
- UI에서 완전 분리됨

**작업 내용**:
- Header의 "Share" 버튼을 드롭다운 메뉴로 변경
- 드롭다운 내부에 Export 옵션 (PDF, HTML, PPTX) 추가
- ExportButtons 코드 재활용 (컴포넌트 직접 렌더 또는 핸들러 추출)

**결정 필요**: Export UI 위치
- Option A: Header "Share" 버튼 → 드롭다운 메뉴 (Share + Export 통합)
- Option B: EditorActionBar에 Export 버튼 추가
- Option C: Header에 별도 Export 버튼 복원

---

### 3.4 [B-1] Present Mode 구현
**난이도**: 낮음 | **예상 변경 파일**: 2개

**현재 상태**:
- Header "Present" 버튼: onClick 없음
- reveal.js는 fullscreen API 지원 내장

**작업 내용**:
- "Present" 버튼에 onClick 핸들러 추가
- reveal.js 컨테이너에 `requestFullscreen()` 호출
- 또는 별도 `/present` 라우트로 전체 화면 프리뷰 페이지 생성
- ESC 키로 복귀 (브라우저 기본 동작)

**구현 방식**:
```typescript
// 방법 1: Fullscreen API (간단)
const handlePresent = () => {
  const revealContainer = document.querySelector('.reveal')
  revealContainer?.requestFullscreen()
}

// 방법 2: 새 탭에서 전체화면 (안정적)
const handlePresent = () => {
  window.open('/present', '_blank')
}
```

---

### 3.5 [C-1] Document Title 영속화
**난이도**: 낮음 | **예상 변경 파일**: 1개

**현재 상태**:
- Zustand store에 `documentTitle` 상태 존재
- 새로고침 시 "Untitled Presentation"으로 초기화

**작업 내용**:
- `slide-store.ts`의 `persist` 미들웨어에 `documentTitle` 추가
- 또는 별도 `localStorage` 동기화 로직 추가

---

### 3.6 [C-2] BottomNavigationBar 보완
**난이도**: 낮음 | **예상 변경 파일**: 1개

**현재 상태**:
- prev/next 동작
- viewMode 토글: 상태만 변경, 실제 레이아웃 변화 없음
- Zoom "Fit" 버튼: onClick 없음

**작업 내용**:
- Zoom "Fit" 버튼에 `revealRef.current?.layout()` 연동 또는 제거
- viewMode 토글은 향후 구현으로 보류 (현재는 비활성화 표시)

---

### 3.7 [C-3] ThumbnailStrip "Add Slide" 버튼
**난이도**: 낮음 | **예상 변경 파일**: 1-2개

**현재 상태**:
- 클릭으로 슬라이드 이동은 동작
- "+" 버튼: onClick 없음
- 실제 썸네일 미리보기 없음 (placeholder 박스)

**작업 내용**:
- "+" 버튼에 새 슬라이드 마크다운 추가 로직 연결
- 마크다운에 `\n---\n\n## New Slide\n` 추가하는 간단한 구현
- 썸네일 실제 렌더링은 범위 제외 (복잡도 높음)

---

## 4. 구현 순서 및 우선순위

| 순서 | 작업 ID | 작업명 | 의존성 | 병렬 가능 |
|------|---------|--------|--------|-----------|
| 1 | A-1 | Theme Selector 재연결 | 없음 | Yes |
| 2 | A-2 | AI Wizard 연동 복원 | 없음 | Yes |
| 3 | A-3 | Export 기능 재연결 | 없음 | Yes |
| 4 | B-1 | Present Mode 구현 | 없음 | Yes |
| 5 | C-1 | Document Title 영속화 | 없음 | Yes |
| 6 | C-2 | BottomNav 보완 | 없음 | Yes |
| 7 | C-3 | ThumbnailStrip Add Slide | 없음 | Yes |

**모든 작업이 독립적** → 병렬 실행 가능

---

## 5. 제외 항목 (Placeholder 유지)

다음 항목들은 이번 작업에서 **제외**하며, 향후 별도 PDCA 사이클로 진행:

| 기능 | 사유 |
|------|------|
| FloatingToolbar 기능화 | 복잡도 높음, 별도 디자인 필요 |
| Share 기능 | 백엔드/URL 생성 로직 필요 |
| Add Media 기능 | 파일 업로드 인프라 필요 |
| Settings 패널 | 별도 디자인 필요 |
| Grid/Filmstrip View 전환 | 레이아웃 설계 필요 |
| 실제 썸네일 렌더링 | Canvas snapshot 로직 복잡 |

---

## 6. 성공 기준

| # | 기준 | 측정 방법 |
|---|------|----------|
| 1 | 테마 변경 UI 존재 + 테마 적용 동작 | 테마 선택 → 슬라이드 스타일 변경 확인 |
| 2 | AI 모드 전환 시 AI Wizard 정상 표시 | ModeSwitcher → AI 탭 → 위저드 패널 표시 |
| 3 | Export 버튼 접근 가능 + 내보내기 동작 | PDF/HTML/PPTX 다운로드 확인 |
| 4 | Present 버튼 클릭 → 전체화면 프리뷰 | 프레젠테이션 모드 진입/종료 |
| 5 | Document Title 새로고침 후 유지 | 제목 수정 → 새로고침 → 동일 제목 |
| 6 | BottomNav 줌/뷰모드 비활성 표시 | 미구현 버튼 시각적 비활성화 |
| 7 | Add Slide 버튼 동작 | + 클릭 → 새 슬라이드 섹션 추가 |
| 8 | 기존 기능 보존 | 마크다운 편집, 슬라이드 네비게이션 정상 |

---

## 7. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| ThemeSelector Radix UI 스타일 충돌 | 중간 | 새 UI 다크 테마에 맞게 스타일 조정 |
| AIWizardPanel isOpen 제거 시 사이드이펙트 | 낮음 | editorMode 조건으로 안전하게 대체 |
| Export 버튼 reveal.js DOM 의존 | 낮음 | 기존 코드 그대로 재활용 |
| Present fullscreen 브라우저 호환성 | 낮음 | Fullscreen API는 모든 모던 브라우저 지원 |

---

## 8. 기존 코드 자산 활용도

| 컴포넌트 | 코드 재활용률 | 변경 범위 |
|---------|-------------|----------|
| `ThemeSelector.tsx` | 90% | 스타일 미세 조정만 |
| `AIWizardPanel.tsx` | 95% | isOpen 게이트 수정만 |
| `ExportButtons.tsx` | 80% | 드롭다운 UI로 재구성 |
| `exportHelper.ts` | 100% | 변경 없음 |
| `pptxExporter.ts` | 100% | 변경 없음 |
| `ai-wizard-store.ts` | 100% | 변경 없음 |
