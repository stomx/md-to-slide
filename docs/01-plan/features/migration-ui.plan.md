# Plan: migration-ui (UI 디자인 마이그레이션)

> **Version**: v0.4.0
> **Created**: 2026-02-09
> **Status**: Draft
> **PDCA Phase**: Plan

---

## 1. 개요

### 1.1 목표
현재 md-to-slides의 기본적인 2단 레이아웃(50:50 에디터/프리뷰)을 **Slide-First Hybrid Workspace** 디자인으로 전면 개편한다. 프리뷰 중심의 시네마틱 레이아웃으로 전환하여 프레젠테이션 제작 경험을 혁신한다.

### 1.2 배경
- 현재 UI는 개발자 도구 느낌의 단순한 레이아웃
- 목표 디자인은 SaaS급 프레젠테이션 도구 수준의 세련된 워크스페이스
- 슬라이드 프리뷰를 중심에 배치하여 "결과물 중심" 워크플로우 제공

### 1.3 범위
- **포함**: 레이아웃, 헤더, 에디터 패널, 프리뷰 영역, 슬라이드 네비게이션, 썸네일 스트립
- **제외**: AI 생성 로직, 백엔드 API, 내보내기 로직 (기존 유지)

---

## 2. 현재 상태 (AS-IS)

### 2.1 레이아웃 구조
```
┌─────────────────────────────────────────────────┐
│ Header: [Logo] [AI 생성] [Theme] [Export]       │
├───────────────────────┬─────────────────────────┤
│                       │                         │
│   MarkdownEditor      │    SlidePreview         │
│      (50%)            │      (50%)              │
│   흰색 배경            │    어두운 배경           │
│                       │                         │
├───────────────────────┴─────────────────────────┤
│ Footer: Slides: N | Theme: X | Saved            │
└─────────────────────────────────────────────────┘
```

### 2.2 현재 컴포넌트 목록
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| Home | `src/app/page.tsx` | 메인 페이지 레이아웃 |
| ResponsiveLayout | `src/components/ResponsiveLayout.tsx` | 반응형 레이아웃 |
| MarkdownEditor | `src/components/MarkdownEditor.tsx` | 마크다운 입력 |
| SlidePreview | `src/components/SlidePreview.tsx` | reveal.js 프리뷰 |
| ThemeSelector | `src/components/ThemeSelector.tsx` | 테마 선택 |
| ExportButtons | `src/components/ExportButtons.tsx` | 내보내기 버튼 |
| AIWizardPanel | `src/components/ai-wizard/AIWizardPanel.tsx` | AI 위저드 |

### 2.3 현재 스타일 시스템
- Tailwind CSS v4 + OKLch 색상 변수
- Radix UI 기반 컴포넌트 (Button, Select, Tabs, Dialog, Tooltip)
- lucide-react 아이콘
- 반응형: Mobile / Tablet(Tabs) / Desktop(Split)

---

## 3. 목표 상태 (TO-BE)

### 3.1 새로운 레이아웃 구조
```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo "SlideCraft"] [Doc Title] [Avatars] [Share] [Present] [Profile] │
├─────────────┬───────────────────────────────────────────────┤
│ Left Panel  │ Right Panel (70%)                        │ T │
│   (30%)     │                                          │ h │
│ ┌─────────┐ │  ┌─ Floating Toolbar ─┐                  │ u │
│ │Mode Tab │ │  │ Layout|Text|Colors │                  │ m │
│ │ MD | AI │ │  └────────────────────┘                  │ b │
│ ├─────────┤ │                                          │ n │
│ │         │ │  ┌──────────────────────────┐             │ a │
│ │Markdown │ │  │                          │             │ i │
│ │ Editor  │ │  │    Slide Preview         │             │ l │
│ │ (Dark)  │ │  │    (Cinematic)           │             │   │
│ │         │ │  │                          │             │ S │
│ ├─────────┤ │  └──────────────────────────┘             │ t │
│ │ Actions │ │                                          │ r │
│ │Add|Tune │ │  ┌─ Bottom Nav ────────────────────────┐ │ i │
│ └─────────┘ │  │ [Grid][Film] | < Slide 4 of 12 > | [Zoom] │ │ p │
│             │  └─────────────────────────────────────┘ │   │
├─────────────┴──────────────────────────────────────────┴───┤
```

### 3.2 핵심 디자인 변경사항

#### A. 헤더 (Header)
| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| 로고 | `Presentation` 아이콘 + 텍스트 | `slideshow` Material 아이콘 + "SlideCraft" |
| 중앙 | 없음 | 문서 제목 (편집 가능) |
| 우측 | AI 버튼 + Theme + Export | 아바타 그룹 + Share + Present(Primary) + Profile |
| 높이 | py-4 (16px) | py-3 (12px), 더 컴팩트 |
| 스타일 | 그림자 + 회색 테두리 | 깔끔한 테두리만 |

#### B. 에디터 패널 (Left Panel - 30%)
| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| 너비 | 50% (또는 40%) | 30% (min 320px, max 450px) |
| 배경 | 흰색 (bg-white) | 다크 (bg-sidebar-dark: #1a1f2c) |
| 텍스트 | 검정 | 라이트 그레이 (text-gray-300) |
| 상단 | 없음 | **Mode Switcher**: Markdown / AI Assistant 토글 |
| 중앙 | Textarea (흰색) | 다크 Textarea + monospace (JetBrains Mono) |
| 하단 | 없음 | **Action Bar**: Add Media + Settings 버튼 |
| 슬라이드 헤더 | 없음 | "Slide 1 Source" + MD 뱃지 |

#### C. 프리뷰 영역 (Right Panel - 70%)
| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| 너비 | 50% (또는 35%) | 70% (flex-1) |
| 배경 | 어두운 단색 | 밝은 도트 패턴 (radial-gradient) |
| 슬라이드 | reveal.js 전체 영역 | **카드형** aspect-video 슬라이드 (shadow-2xl, rounded-xl) |
| 툴바 | 없음 | **Floating Toolbar** (Layout, Text, Colors, Animation) |
| 패딩 | 없음 | 충분한 여백 (p-8 ~ p-16) |

#### D. 슬라이드 네비게이션 (Bottom Bar) - **신규**
| 요소 | 설명 |
|------|------|
| 좌측 | 뷰 토글 (Grid View / Filmstrip View) |
| 중앙 | 슬라이드 네비게이터 (< Slide N of M >) |
| 우측 | 줌 컨트롤 (Fit + 슬라이더) |

#### E. 썸네일 스트립 (Thumbnail Strip) - **신규**
| 요소 | 설명 |
|------|------|
| 위치 | 프리뷰 영역 우측 가장자리 |
| 너비 | 64px (w-16) |
| 내용 | 슬라이드 미니 썸네일 + 번호 뱃지 |
| 활성 슬라이드 | 확대 (w-12) + primary 테두리 |
| 하단 | + 버튼 (새 슬라이드 추가) |

#### F. 아이콘 시스템 변경
| AS-IS | TO-BE |
|-------|-------|
| lucide-react | Google Material Symbols Outlined |

#### G. 폰트 변경
| AS-IS | TO-BE |
|-------|-------|
| 시스템 폰트 | Inter (본문) + JetBrains Mono (에디터) |

---

## 4. 구현 전략

### 4.1 단계별 접근 (점진적 마이그레이션)

#### Phase 1: 기반 설정
- [ ] 폰트 추가 (Inter, JetBrains Mono, Material Symbols)
- [ ] Tailwind 커스텀 색상 추가 (primary, sidebar-dark 등)
- [ ] 새로운 색상 변수 정의

#### Phase 2: 레이아웃 리팩터링
- [ ] `ResponsiveLayout.tsx` 리팩터링: 30:70 비율 + 사이드바 스타일
- [ ] `page.tsx` 헤더 전면 교체
- [ ] Footer → BottomNavigationBar 컴포넌트로 교체

#### Phase 3: 에디터 패널 재설계
- [ ] MarkdownEditor 다크 테마 적용
- [ ] Mode Switcher 컴포넌트 신규 생성 (Markdown / AI 토글)
- [ ] 슬라이드 소스 헤더 추가
- [ ] 하단 Action Bar 추가 (Add Media, Settings)

#### Phase 4: 프리뷰 영역 재설계
- [ ] 도트 패턴 배경 적용
- [ ] 슬라이드를 카드형 aspect-video로 변경
- [ ] Floating Toolbar 컴포넌트 신규 생성

#### Phase 5: 네비게이션 컴포넌트
- [ ] BottomNavigationBar 컴포넌트 신규 생성
- [ ] ThumbnailStrip 컴포넌트 신규 생성
- [ ] 슬라이드 네비게이션 상태 관리 (현재 슬라이드 인덱스)

#### Phase 6: 통합 및 Polish
- [ ] 반응형 대응 (Tablet, Mobile)
- [ ] 다크모드 호환성 확인
- [ ] 애니메이션/트랜지션 적용
- [ ] 접근성(a11y) 검증

### 4.2 새로 생성할 컴포넌트
| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| ModeSwitcher | `src/components/ModeSwitcher.tsx` | Markdown/AI 토글 스위처 |
| BottomNavigationBar | `src/components/BottomNavigationBar.tsx` | 하단 슬라이드 네비게이션 |
| ThumbnailStrip | `src/components/ThumbnailStrip.tsx` | 우측 슬라이드 썸네일 |
| FloatingToolbar | `src/components/FloatingToolbar.tsx` | 프리뷰 위 플로팅 툴바 |
| SlideCanvas | `src/components/SlideCanvas.tsx` | 카드형 슬라이드 래퍼 |
| EditorActionBar | `src/components/EditorActionBar.tsx` | 에디터 하단 액션 바 |

### 4.3 수정할 기존 컴포넌트
| 컴포넌트 | 변경 내용 |
|---------|----------|
| `page.tsx` | 헤더 전면 재설계, 레이아웃 구조 변경 |
| `ResponsiveLayout.tsx` | 30:70 비율, 다크 사이드바 |
| `MarkdownEditor.tsx` | 다크 테마, JetBrains Mono, 슬라이드 헤더 |
| `SlidePreview.tsx` | 카드형 래핑, 도트 패턴 배경 |
| `globals.css` | 새 CSS 변수, 폰트 import |

### 4.4 삭제/교체할 요소
| 항목 | 사유 |
|------|------|
| lucide-react 아이콘 (일부) | Material Symbols로 교체 |
| 기존 Footer | BottomNavigationBar로 대체 |
| ThemeSelector 위치 | 헤더에서 FloatingToolbar로 이동 |
| ExportButtons 위치 | Share/Present 버튼으로 통합 |

---

## 5. 상태 관리 변경

### 5.1 slide-store 확장
```typescript
// 추가할 상태
interface SlideStoreExtension {
  currentSlideIndex: number       // 현재 선택된 슬라이드 (0-based)
  viewMode: 'filmstrip' | 'grid'  // 뷰 모드
  zoomLevel: number               // 줌 레벨 (0-100)
  editorMode: 'markdown' | 'ai'   // 에디터 모드 토글
  documentTitle: string           // 문서 제목

  // Actions
  setCurrentSlideIndex: (index: number) => void
  setViewMode: (mode: 'filmstrip' | 'grid') => void
  setZoomLevel: (level: number) => void
  setEditorMode: (mode: 'markdown' | 'ai') => void
  setDocumentTitle: (title: string) => void
  goToNextSlide: () => void
  goToPrevSlide: () => void
}
```

---

## 6. 의존성 변경

### 6.1 추가
| 패키지 | 용도 |
|--------|------|
| (없음 - CDN 사용) | Google Fonts: Inter, JetBrains Mono |
| (없음 - CDN 사용) | Material Symbols Outlined |

### 6.2 유지
| 패키지 | 사유 |
|--------|------|
| reveal.js | 슬라이드 렌더링 엔진 유지 |
| @radix-ui/* | 접근성 기반 UI 프리미티브 유지 |
| zustand | 상태 관리 유지 |
| tailwindcss | 스타일링 유지 |

### 6.3 선택적 제거 검토
| 패키지 | 검토 사유 |
|--------|----------|
| lucide-react | Material Symbols로 대체 시 제거 가능 |

---

## 7. 리스크 및 제약사항

### 7.1 기술 리스크
| 리스크 | 영향 | 대응 |
|--------|------|------|
| reveal.js 카드형 래핑 호환성 | 높음 | SlideCanvas 래퍼로 격리 |
| 다크 에디터에서 구문 강조 가독성 | 중간 | 색상 변수 조정 |
| 30% 에디터 너비에서 편집 UX | 중간 | min-width 320px 보장, 리사이즈 핸들 검토 |

### 7.2 제약사항
- 기존 AI 생성 플로우(SSE 스트리밍)는 변경하지 않음
- 내보내기 로직(PDF/HTML/PPTX)은 그대로 유지
- reveal.js 핵심 설정(REVEAL_CONFIG)은 유지

---

## 8. 성공 기준

| 기준 | 측정 방법 |
|------|----------|
| 레이아웃 30:70 구현 | 브라우저에서 비율 확인 |
| 다크 사이드바 에디터 | 시각적 확인 |
| 슬라이드 네비게이션 동작 | 이전/다음 슬라이드 이동 |
| 썸네일 스트립 동작 | 클릭으로 슬라이드 이동 |
| Mode Switcher 동작 | Markdown/AI 토글 전환 |
| 반응형 대응 | Mobile/Tablet/Desktop 확인 |
| 기존 기능 정상 동작 | 마크다운 편집, AI 생성, 내보내기 |

---

## 9. 타임라인 (추정)

| Phase | 작업 | 예상 |
|-------|------|------|
| Phase 1 | 기반 설정 | 소규모 |
| Phase 2 | 레이아웃 리팩터링 | 중규모 |
| Phase 3 | 에디터 패널 | 중규모 |
| Phase 4 | 프리뷰 영역 | 중규모 |
| Phase 5 | 네비게이션 | 대규모 |
| Phase 6 | 통합/Polish | 중규모 |
