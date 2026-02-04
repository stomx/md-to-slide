# ux-optimization Planning Document

> **Summary**: 사용자 경험 최적화 - 로딩 상태, 에러 처리, 접근성, 반응형 디자인 개선
>
> **Project**: md-to-slide
> **Version**: 1.1.0
> **Author**: Claude Code
> **Date**: 2026-02-04
> **Status**: Draft
> **Base Version**: 1.0.0 (md-to-slide-core)

---

## 1. Overview

### 1.1 Purpose

md-to-slide v1.0.0의 핵심 기능은 완성되었으나, 사용자 경험(UX) 측면에서 개선이 필요합니다. 이 기능은 로딩 상태 표시, 에러 처리, 접근성, 반응형 디자인 등을 개선하여 더 직관적이고 사용하기 쉬운 애플리케이션을 만듭니다.

### 1.2 Background

**현재 문제점 (v1.0.0):**
- 마크다운 파싱 중 로딩 표시 없음 → 사용자가 앱이 멈춘 것으로 오해
- 에러 발생 시 콘솔에만 표시 → 사용자가 문제를 인지하지 못함
- 모바일/태블릿에서 레이아웃 깨짐 → 반응형 디자인 부족
- 접근성 부족 → 스크린 리더 사용자가 사용 어려움
- 키보드 단축키 없음 → 마우스 없이 사용 불가
- 도움말 없음 → 신규 사용자 학습 곡선 높음

**해결책:**
- 모든 비동기 작업에 로딩 인디케이터 추가
- Toast/Alert 컴포넌트로 사용자 친화적 에러 메시지 표시
- Tailwind CSS 반응형 유틸리티로 모바일 최적화
- ARIA 레이블 및 시맨틱 HTML로 접근성 강화
- 키보드 단축키 시스템 구현
- 온보딩 튜토리얼 및 도움말 모달 추가

### 1.3 Related Documents

- v1.0.0 Plan: `docs/archive/2026-02/md-to-slide-core/md-to-slide-core.plan.md`
- v1.0.0 Design: `docs/archive/2026-02/md-to-slide-core/md-to-slide-core.design.md`
- WCAG 2.1 Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Material Design - Feedback Patterns: https://m3.material.io/foundations/interaction/states/overview
- Tailwind CSS Responsive Design: https://tailwindcss.com/docs/responsive-design

---

## 2. Scope

### 2.1 In Scope

- [x] **로딩 상태 (Loading States)**
  - 마크다운 파싱 중 로딩 스피너
  - 테마 적용 중 로딩 인디케이터
  - PDF/HTML 내보내기 중 진행 상태 표시
  - 스켈레톤 UI (Skeleton screens) for 초기 로딩

- [x] **에러 처리 (Error Handling)**
  - Toast 알림 시스템 (성공/에러/경고/정보)
  - 마크다운 파싱 에러 시 라인 번호 표시
  - 내보내기 실패 시 재시도 옵션
  - 네트워크 에러 감지 및 오프라인 모드 안내

- [x] **접근성 (Accessibility - a11y)**
  - ARIA 레이블 (버튼, 입력 필드, 모달)
  - 스크린 리더 지원 (VoiceOver, NVDA, JAWS)
  - 키보드 네비게이션 (Tab, Enter, Esc, 화살표)
  - 포커스 인디케이터 강화 (Focus visible)
  - 색상 대비 비율 WCAG AA 준수 (4.5:1)

- [x] **반응형 디자인 (Responsive Design)**
  - 모바일 (< 640px): 단일 컬럼 레이아웃
  - 태블릿 (640px ~ 1024px): 적응형 레이아웃
  - 데스크톱 (>= 1024px): 기존 2컬럼 유지
  - 터치 제스처 지원 (스와이프, 핀치 줌)

- [x] **사용자 피드백 (User Feedback)**
  - 성공 메시지 (테마 변경, 내보내기 완료)
  - 복사 성공 알림 (HTML 코드 복사)
  - 툴팁 (버튼 설명, 단축키 안내)
  - 진행 상태 표시 (파싱 진행률, 내보내기 진행률)

- [x] **도움말/튜토리얼 (Help/Tutorial)**
  - 첫 방문 시 온보딩 튜토리얼 (Intro.js 또는 커스텀)
  - 키보드 단축키 모달 (Cmd/Ctrl + ?)
  - 마크다운 문법 가이드 모달
  - FAQ 섹션 (자주 묻는 질문)

- [x] **키보드 단축키 (Keyboard Shortcuts)**
  - `Cmd/Ctrl + S`: 마크다운 저장 (로컬 스토리지)
  - `Cmd/Ctrl + E`: PDF 내보내기
  - `Cmd/Ctrl + Shift + E`: HTML 내보내기
  - `Cmd/Ctrl + K`: 키보드 단축키 모달 열기
  - `Cmd/Ctrl + ?`: 도움말 모달 열기
  - `Esc`: 모달 닫기

### 2.2 Out of Scope

- ❌ 다국어 지원 (i18n) - v1.2.0으로 연기
- ❌ 다크 모드 전환 - v1.2.0으로 연기
- ❌ 사용자 설정 저장 (테마 선호도, 레이아웃) - v1.2.0으로 연기
- ❌ 애니메이션 효과 (페이드, 슬라이드) - v1.3.0으로 연기
- ❌ 커스텀 테마 에디터 - v2.0.0으로 연기
- ❌ 고급 접근성 (고대비 모드, 확대/축소) - v1.2.0으로 연기

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-10 | 마크다운 파싱 중 로딩 스피너 표시 | High | Pending |
| FR-11 | 테마 변경 시 로딩 인디케이터 표시 | Medium | Pending |
| FR-12 | PDF/HTML 내보내기 중 진행 상태 바 표시 | High | Pending |
| FR-13 | 파싱 에러 발생 시 Toast 알림 표시 (에러 라인 번호 포함) | High | Pending |
| FR-14 | 내보내기 실패 시 Toast 알림 + 재시도 버튼 | High | Pending |
| FR-15 | 모든 버튼에 ARIA 레이블 추가 | High | Pending |
| FR-16 | 키보드만으로 전체 앱 네비게이션 가능 | High | Pending |
| FR-17 | 포커스 인디케이터 강화 (ring-2 ring-blue-500) | High | Pending |
| FR-18 | 모바일 (<640px)에서 단일 컬럼 레이아웃 전환 | High | Pending |
| FR-19 | 태블릿 (640px~1024px)에서 적응형 레이아웃 | Medium | Pending |
| FR-20 | 키보드 단축키 시스템 구현 (Cmd+S, Cmd+E 등) | High | Pending |
| FR-21 | 키보드 단축키 도움말 모달 (Cmd+K) | Medium | Pending |
| FR-22 | 첫 방문 시 온보딩 튜토리얼 표시 | Low | Pending |
| FR-23 | 마크다운 문법 가이드 모달 | Low | Pending |
| FR-24 | 테마 변경 성공 시 Toast 알림 | Low | Pending |
| FR-25 | HTML 코드 복사 성공 시 Toast 알림 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Accessibility | WCAG 2.1 AA 준수 (색상 대비 4.5:1) | axe DevTools, Lighthouse Accessibility Score >= 90 |
| Accessibility | 키보드만으로 모든 기능 접근 가능 | 수동 키보드 네비게이션 테스트 |
| Accessibility | 스크린 리더 호환성 (VoiceOver, NVDA) | 스크린 리더 테스트 |
| Responsiveness | 모바일 (320px ~ 640px) 레이아웃 깨지지 않음 | Chrome DevTools Device Mode |
| Responsiveness | 태블릿 (640px ~ 1024px) 레이아웃 최적화 | iPad, Surface 테스트 |
| Performance | 로딩 인디케이터 표시 지연 < 100ms | 디바운스 타이머 측정 |
| Usability | 키보드 단축키 학습 시간 < 2분 | 사용자 테스트 (도움말 모달 참고 후) |
| Usability | 에러 메시지 이해도 >= 95% | 사용자 설문 (에러 해결 가능 여부) |

---

## 4. Success Criteria

### 4.1 Quantitative Metrics

| Metric | Current (v1.0.0) | Target (v1.1.0) | Measurement |
|--------|------------------|-----------------|-------------|
| Lighthouse Accessibility Score | ~75 | >= 90 | Chrome DevTools Lighthouse |
| 키보드 네비게이션 커버리지 | ~40% | 100% | 수동 테스트 (모든 버튼/입력 필드) |
| 모바일 레이아웃 에러 | 있음 | 없음 | Chrome DevTools Device Mode |
| 에러 인지율 (사용자가 에러 발생 인지) | ~30% | >= 95% | Toast 알림 표시 후 설문 |
| 평균 작업 완료 시간 (첫 슬라이드 생성) | ~5분 | ~3분 | 온보딩 튜토리얼 후 측정 |

### 4.2 Qualitative Criteria

- ✅ **직관성**: 신규 사용자가 도움말 없이 기본 기능 사용 가능
- ✅ **피드백**: 모든 사용자 액션에 즉각적인 시각적 피드백 제공
- ✅ **접근성**: 시각 장애인이 스크린 리더로 앱 사용 가능
- ✅ **반응성**: 모바일/태블릿에서도 데스크톱과 동일한 기능 제공
- ✅ **학습 용이성**: 키보드 단축키 가이드로 빠른 작업 가능

---

## 5. Technical Approach

### 5.1 Components to Add

| Component | Purpose | Library/Tool |
|-----------|---------|--------------|
| `Toast` | 알림 메시지 표시 | react-hot-toast or shadcn/ui Sonner |
| `LoadingSpinner` | 로딩 스피너 | Custom SVG or lucide-react |
| `ProgressBar` | 진행 상태 바 | Custom or nprogress |
| `KeyboardShortcutModal` | 키보드 단축키 도움말 | shadcn/ui Dialog |
| `OnboardingTutorial` | 온보딩 튜토리얼 | Intro.js or react-joyride |
| `MarkdownGuideModal` | 마크다운 문법 가이드 | shadcn/ui Dialog |
| `Tooltip` | 툴팁 | shadcn/ui Tooltip |
| `SkeletonLoader` | 스켈레톤 UI | shadcn/ui Skeleton |

### 5.2 Utilities to Add

| Utility | Purpose | Implementation |
|---------|---------|----------------|
| `useKeyboardShortcut` | 키보드 단축키 hook | Custom hook with addEventListener |
| `useToast` | Toast 알림 hook | react-hot-toast or Sonner |
| `useMediaQuery` | 반응형 디자인 hook | Custom hook with matchMedia |
| `useFocusTrap` | 모달 포커스 트랩 | focus-trap-react or custom |
| `announceToScreenReader` | 스크린 리더 알림 | ARIA live region |

### 5.3 Store Enhancements

**SlideStore에 추가할 상태:**

```typescript
interface SlideStore {
  // Existing states...

  // New UX states
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;

  // Actions
  setLoading: (isLoading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

### 5.4 Accessibility Enhancements

**ARIA 레이블 추가:**
- `<button aria-label="Export to PDF">` - 모든 버튼
- `<textarea aria-label="Markdown editor" aria-describedby="editor-help">` - 에디터
- `<div role="alert" aria-live="assertive">` - 에러 메시지
- `<nav aria-label="Main navigation">` - 네비게이션

**키보드 네비게이션:**
- Tab 순서 최적화 (tabIndex)
- Enter/Space로 버튼 트리거
- Esc로 모달 닫기
- 화살표로 슬라이드 네비게이션

### 5.5 Responsive Design Strategy

**Breakpoints (Tailwind CSS):**
```typescript
// tailwind.config.js 기본값 사용
sm: 640px   // 모바일 → 태블릿
md: 768px   // 태블릿
lg: 1024px  // 데스크톱
xl: 1280px  // 큰 데스크톱
```

**Layout Changes:**
- `< 640px`: 단일 컬럼 (에디터 위, 미리보기 아래)
- `640px ~ 1024px`: 탭 UI (에디터 탭 / 미리보기 탭)
- `>= 1024px`: 2컬럼 레이아웃 (기존 유지)

---

## 6. Dependencies

### 6.1 NPM Packages

| Package | Version | Purpose | Size |
|---------|---------|---------|------|
| `react-hot-toast` | ^2.4.1 | Toast 알림 시스템 | ~15 KB |
| `react-joyride` | ^2.7.0 | 온보딩 튜토리얼 | ~45 KB |
| `@radix-ui/react-tooltip` | ^1.0.7 | 툴팁 (shadcn/ui) | ~20 KB |
| `@radix-ui/react-dialog` | ^1.0.5 | 모달 (shadcn/ui) | ~25 KB |
| `lucide-react` | ^0.300.0 | 아이콘 (이미 설치됨) | - |

**Total**: ~105 KB (gzipped: ~35 KB)

### 6.2 Existing Codebase

- `src/components/MarkdownEditor.tsx` - ARIA 레이블 추가 필요
- `src/components/SlidePreview.tsx` - 로딩 상태 표시 필요
- `src/components/ExportButtons.tsx` - 진행 상태 바 추가 필요
- `src/store/slide-store.ts` - UX 상태 추가 필요

---

## 7. Timeline

### 7.1 Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: 로딩 상태** | LoadingSpinner, ProgressBar, 로딩 상태 통합 | 2 hours |
| **Phase 2: 에러 처리** | Toast 시스템, 에러 메시지, 재시도 로직 | 2 hours |
| **Phase 3: 접근성** | ARIA 레이블, 키보드 네비게이션, 포커스 트랩 | 3 hours |
| **Phase 4: 반응형** | 모바일 레이아웃, 태블릿 최적화, 미디어 쿼리 | 2 hours |
| **Phase 5: 키보드 단축키** | 단축키 시스템, 도움말 모달 | 1.5 hours |
| **Phase 6: 튜토리얼** | 온보딩, 마크다운 가이드, 툴팁 | 1.5 hours |
| **Phase 7: 테스트** | 접근성 테스트, 반응형 테스트, 키보드 테스트 | 2 hours |

**Total Estimated Time**: ~14 hours

### 7.2 Implementation Order

```
1. Phase 1: 로딩 상태 (기반 구조)
   ↓
2. Phase 2: 에러 처리 (Toast 시스템)
   ↓
3. Phase 4: 반응형 (레이아웃 재구성)
   ↓
4. Phase 3: 접근성 (ARIA, 키보드)
   ↓
5. Phase 5: 키보드 단축키
   ↓
6. Phase 6: 튜토리얼/도움말
   ↓
7. Phase 7: 테스트 및 검증
```

**Rationale**: 로딩/에러 처리 → 반응형 → 접근성 → 고급 기능 순으로 진행하여 기반을 먼저 다진 후 향상

---

## 8. Risks & Mitigation

### 8.1 Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 번들 크기 증가 (Toast, Tutorial 라이브러리) | High | Medium | Tree-shaking, lazy loading으로 번들 최적화 |
| 모바일에서 reveal.js 성능 저하 | Medium | High | 모바일에서 슬라이드 수 제한 (50개), 경고 표시 |
| 키보드 단축키 충돌 (브라우저 기본 단축키) | Medium | Low | 사용자 정의 단축키 허용, 충돌 방지 로직 |
| 접근성 테스트 부족 (스크린 리더 미보유) | High | High | 온라인 도구 활용 (axe DevTools, WAVE), 커뮤니티 피드백 |
| 온보딩 튜토리얼이 방해됨 (Skip 옵션 필요) | Medium | Low | "다시 보지 않기" 체크박스, localStorage 저장 |

### 8.2 Mitigation Strategies

1. **번들 크기 관리**:
   - `react-hot-toast` 대신 더 가벼운 `sonner` 고려 (~8 KB)
   - `react-joyride` 대신 커스텀 튜토리얼 구현 (필요 시)
   - Dynamic import로 튜토리얼/도움말 lazy loading

2. **모바일 성능**:
   - 1000줄 이상 마크다운 입력 시 경고 표시
   - 모바일에서 슬라이드 애니메이션 비활성화 옵션
   - `will-change: transform` CSS로 렌더링 최적화

3. **접근성 검증**:
   - Lighthouse Accessibility 점수 >= 90 목표
   - axe DevTools로 자동 테스트
   - WCAG 2.1 체크리스트 수동 검증

4. **사용자 테스트**:
   - 신규 사용자 5명에게 온보딩 테스트
   - 키보드 전용 사용자 테스트 (마우스 없이)
   - 모바일 기기 실물 테스트 (iPhone, Android)

---

## 9. Out of Scope Rationale

### 9.1 Deferred to v1.2.0

- **다국어 지원 (i18n)**: 번역 작업 시간 소요, 우선순위 낮음
- **다크 모드**: 테마 시스템 재설계 필요, 추가 테스트 필요
- **사용자 설정 저장**: LocalStorage/IndexedDB 설계 필요, 데이터 마이그레이션 복잡

### 9.2 Deferred to v2.0.0

- **커스텀 테마 에디터**: CSS 변수 에디터 UI 복잡, 별도 기능으로 분리
- **고급 애니메이션**: reveal.js 고급 API 연구 필요, 성능 영향 큼

---

## 10. Approval

### 10.1 Stakeholders

| Role | Name | Approval Status |
|------|------|----------------|
| Product Owner | User | Pending |
| Developer | Claude Code | Pending |

### 10.2 Sign-off Criteria

- [ ] 모든 FR (FR-10 ~ FR-25) 요구사항 확인
- [ ] 번들 크기 증가 < 50 KB 확인
- [ ] Lighthouse Accessibility Score >= 90 목표 확인
- [ ] 타임라인 (~14 hours) 승인

---

## 11. Appendix

### 11.1 Keyboard Shortcuts Reference

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + S` | 마크다운 저장 (로컬 스토리지) | 에디터 포커스 시 |
| `Cmd/Ctrl + E` | PDF 내보내기 | 전역 |
| `Cmd/Ctrl + Shift + E` | HTML 내보내기 | 전역 |
| `Cmd/Ctrl + K` | 키보드 단축키 모달 열기 | 전역 |
| `Cmd/Ctrl + ?` | 도움말 모달 열기 | 전역 |
| `Esc` | 모달 닫기 | 모달 열림 시 |
| `Tab` | 다음 요소로 포커스 이동 | 전역 |
| `Shift + Tab` | 이전 요소로 포커스 이동 | 전역 |

### 11.2 WCAG 2.1 AA Checklist

- [ ] **1.1.1** 텍스트 대체 (모든 이미지/아이콘에 alt 속성)
- [ ] **1.4.3** 색상 대비 (최소 4.5:1)
- [ ] **2.1.1** 키보드 접근 (모든 기능 키보드로 접근 가능)
- [ ] **2.4.7** 포커스 표시 (포커스 인디케이터 명확)
- [ ] **3.2.4** 일관된 식별 (동일 기능은 동일 레이블)
- [ ] **4.1.2** 이름, 역할, 값 (모든 UI 요소에 ARIA 속성)

### 11.3 Design Inspiration

- **Toast Notifications**: Vercel Toast, GitHub Toast
- **Loading States**: Linear App, Notion
- **Onboarding**: Loom, Grammarly
- **Keyboard Shortcuts**: VS Code, Raycast
- **Responsive Design**: Tailwind UI, shadcn/ui

---

**Last Updated**: 2026-02-04
**Status**: Ready for Design Phase
