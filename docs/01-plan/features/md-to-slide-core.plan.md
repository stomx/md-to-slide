# md-to-slide-core Planning Document

> **Summary**: reveal.js 기반 마크다운 → 슬라이드 자동 변환 도구
>
> **Project**: md-to-slide
> **Version**: 0.1.0
> **Author**: Claude Code
> **Date**: 2026-02-04
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

마크다운 문법으로 작성된 문서를 reveal.js 프레젠테이션 슬라이드로 자동 변환하는 정적 웹 애플리케이션을 구축합니다. 사용자는 복잡한 HTML/CSS 지식 없이도 마크다운만으로 전문적인 슬라이드를 제작할 수 있습니다.

### 1.2 Background

**문제점:**
- PowerPoint/Keynote는 버전 관리가 어렵고 협업이 불편함
- 개발자/기술 문서 작성자는 마크다운에 익숙하지만 슬라이드 제작 도구는 복잡함
- 기존 마크다운 문서를 슬라이드로 재사용하기 어려움

**해결책:**
- reveal.js를 활용한 웹 기반 슬라이드 생성
- 마크다운 → HTML 자동 변환
- Git 버전 관리 가능
- 브라우저에서 바로 프레젠테이션 실행

### 1.3 Related Documents

- reveal.js 공식 문서: https://revealjs.com/
- reveal.js GitHub: https://github.com/hakimel/reveal.js
- reveal.js Markdown 가이드: https://revealjs.com/markdown/

---

## 2. Scope

### 2.1 In Scope

- [x] **마크다운 파싱 및 슬라이드 변환**
  - `---` (수평 슬라이드) 및 `-----` (수직 슬라이드) 구분자 지원
  - 외부 `.md` 파일 로드 및 파싱
  - reveal.js 플러그인 통합

- [x] **실시간 미리보기**
  - 마크다운 에디터 (좌측 패널)
  - 슬라이드 미리보기 (우측 패널)
  - 실시간 동기화 (debounce 적용)

- [x] **테마 커스터마이징**
  - 12개 기본 테마 선택 UI (black, white, league, beige, night, serif, simple, solarized, moon, dracula, sky, blood)
  - CSS 변수 기반 커스터마이징 (색상, 폰트 등)
  - 테마 미리보기 기능

- [x] **내보내기 (Export)**
  - PDF 내보내기 (`?print-pdf` 파라미터 활용)
  - 독립 HTML 파일 생성 (reveal.js 포함)
  - 로컬 저장 기능

### 2.2 Out of Scope

- ❌ 사용자 인증/로그인 (Starter 레벨 - 백엔드 불필요)
- ❌ 클라우드 스토리지 (로컬 파일 시스템만 사용)
- ❌ 협업 기능 (실시간 공동 편집)
- ❌ 슬라이드 애니메이션 고급 설정 (reveal.js 기본 기능만 사용)
- ❌ 이미지 업로드 서버 (Base64 인코딩 또는 외부 URL 참조)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 마크다운 텍스트를 reveal.js 슬라이드로 변환 | High | Pending |
| FR-02 | `---` (수평 슬라이드) 및 `-----` (수직 슬라이드) 구분자 파싱 | High | Pending |
| FR-03 | 실시간 에디터 ↔ 미리보기 동기화 (300ms debounce) | High | Pending |
| FR-04 | 12개 기본 테마 중 선택 가능한 UI 제공 | Medium | Pending |
| FR-05 | CSS 변수 기반 테마 커스터마이징 (색상, 폰트) | Medium | Pending |
| FR-06 | PDF로 내보내기 (브라우저 인쇄 기능 활용) | High | Pending |
| FR-07 | 독립 HTML 파일 생성 (reveal.js + 마크다운 포함) | High | Pending |
| FR-08 | 로컬 파일 시스템에서 `.md` 파일 불러오기 | Medium | Pending |
| FR-09 | 마크다운 샘플 템플릿 제공 (시작 가이드) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 마크다운 파싱 시간 < 100ms (1000줄 기준) | Chrome DevTools Performance |
| Performance | 실시간 미리보기 렌더링 < 200ms | 디바운스 후 렌더링 시간 측정 |
| Usability | 첫 사용자도 3분 내 슬라이드 생성 가능 | 사용자 테스트 |
| Compatibility | Chrome, Firefox, Safari 최신 버전 지원 | 브라우저 테스트 |
| Accessibility | 키보드 네비게이션 지원 (Tab, Enter, Esc) | 수동 접근성 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] 마크다운 입력 시 슬라이드 자동 변환
- [x] 12개 테마 모두 정상 적용
- [x] PDF 내보내기 기능 동작
- [x] 독립 HTML 파일 생성 및 다운로드
- [x] 모든 기능 Chrome/Firefox에서 테스트 완료
- [x] README 작성 (사용법, 예제 포함)

### 4.2 Quality Criteria

- [x] 빌드 에러 없음 (TypeScript, ESLint)
- [x] reveal.js 플러그인 정상 로드
- [x] 브라우저 콘솔 에러 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| reveal.js CDN 장애 시 슬라이드 로드 실패 | High | Low | 로컬 파일로 번들링 (dist 폴더 포함) |
| 마크다운 파싱 라이브러리 성능 이슈 | Medium | Low | marked.js 사용 (가볍고 빠름) |
| 브라우저 간 CSS 호환성 문제 | Medium | Medium | PostCSS autoprefixer 적용 |
| 대용량 마크다운 파일 파싱 시 UI 블로킹 | Medium | Medium | Web Worker로 파싱 처리 또는 debounce 증가 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☑ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☐ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

**선택 근거:**
- 백엔드 불필요 (정적 사이트)
- 사용자 인증 없음
- 로컬 파일 시스템만 사용
- Starter 레벨 구조로 충분

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vanilla JS | **Next.js 15** | SSG 지원, 빠른 개발 속도, TypeScript 통합 |
| State Management | Context / Zustand / Jotai / None | **Zustand** | 경량, 간단한 API, 보일러플레이트 최소 |
| Markdown Parser | marked / remark / markdown-it | **marked** | 가볍고 빠름, reveal.js와 호환성 우수 |
| Styling | Tailwind / CSS Modules / styled-components | **Tailwind CSS** | 빠른 UI 구축, reveal.js 테마와 충돌 없음 |
| File Handling | File API / FileReader | **FileReader API** | 브라우저 네이티브, 외부 라이브러리 불필요 |
| Export | jsPDF / Browser Print API | **Browser Print API** | reveal.js 권장 방식, 추가 라이브러리 불필요 |

### 6.3 Clean Architecture Approach

```
Selected Level: Starter

Folder Structure:
md-to-slide/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 메인 에디터 페이지
│   │   ├── layout.tsx         # 레이아웃
│   │   └── globals.css        # Tailwind CSS
│   ├── components/            # UI 컴포넌트
│   │   ├── MarkdownEditor.tsx # 마크다운 입력 에디터
│   │   ├── SlidePreview.tsx   # 슬라이드 미리보기
│   │   ├── ThemeSelector.tsx  # 테마 선택 UI
│   │   └── ExportButtons.tsx  # PDF/HTML 내보내기 버튼
│   ├── lib/                   # 유틸리티 함수
│   │   ├── markdown-parser.ts # 마크다운 → reveal.js 변환
│   │   ├── theme-manager.ts   # 테마 적용 로직
│   │   └── export-helper.ts   # PDF/HTML 내보내기 로직
│   ├── types/                 # TypeScript 타입 정의
│   │   └── slide.types.ts
│   └── store/                 # Zustand 상태 관리
│       └── slide-store.ts
├── public/
│   ├── reveal.js/             # reveal.js 라이브러리 (로컬 번들)
│   │   ├── dist/
│   │   └── plugin/
│   └── sample.md              # 샘플 마크다운
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

현재 프로젝트 상태:

- [ ] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] `CONVENTIONS.md` exists at project root
- [ ] ESLint configuration (`.eslintrc.*`)
- [ ] Prettier configuration (`.prettierrc`)
- [ ] TypeScript configuration (`tsconfig.json`)

**→ Phase 2 (Convention)에서 작성 필요**

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | missing | 컴포넌트: PascalCase, 함수: camelCase, 상수: UPPER_SNAKE_CASE | High |
| **Folder structure** | missing | Starter 레벨 구조 (components, lib, types, store) | High |
| **Import order** | missing | 1) React, 2) 외부 라이브러리, 3) 내부 모듈, 4) CSS | Medium |
| **Error handling** | missing | try-catch + 사용자 친화적 에러 메시지 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_REVEAL_CDN` | reveal.js CDN URL (fallback) | Client | ☑ |

**참고:** Starter 레벨이므로 환경 변수 최소화

### 7.4 Pipeline Integration

9-phase Development Pipeline 진행 상태:

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | 🔄 | `docs/01-plan/schema.md` | 다음 단계 진행 필요 |
| Phase 2 (Convention) | ☐ | `docs/01-plan/conventions.md` | `/pdca next` |

**다음 단계:**
1. Schema 정의 (용어, 엔티티)
2. Convention 정의 (코딩 규칙)
3. Design 문서 작성

---

## 8. Next Steps

1. [ ] Phase 1 Schema 문서 작성 (`/phase-1-schema`)
2. [ ] Phase 2 Convention 문서 작성 (`/phase-2-convention`)
3. [ ] Design 문서 작성 (`/pdca design md-to-slide-core`)
4. [ ] 프로젝트 초기화 (Next.js, TypeScript, Tailwind)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-04 | Initial draft | Claude Code |
