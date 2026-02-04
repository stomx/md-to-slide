# Glossary (용어집)

> md-to-slide 프로젝트 용어 정의 및 매핑

**Project**: md-to-slide
**Date**: 2026-02-04
**Version**: 1.0

---

## Business Terms (내부 용어)

| Term | Korean | Definition | Global Standard Mapping |
|------|--------|------------|------------------------|
| **Slide** | 슬라이드 | reveal.js로 렌더링되는 단일 화면 단위 | Page, Screen |
| **Deck** | 덱 | 전체 슬라이드 묶음 (프레젠테이션 단위) | Presentation, Slideshow |
| **Section** | 섹션 | 슬라이드 그룹 (수평/수직 구조) | Group, Collection |
| **Theme** | 테마 | 슬라이드 디자인 스타일 (색상, 폰트 등) | Style, Skin |
| **Separator** | 구분자 | 마크다운에서 슬라이드를 나누는 문자열 (`---`, `-----`) | Delimiter, Divider |
| **Fragment** | 프래그먼트 | 슬라이드 내 단계적 등장 요소 | Step, Incremental Element |
| **Speaker Notes** | 발표자 노트 | 슬라이드에 첨부되는 메모 (청중에게 비표시) | Notes, Presenter Notes |
| **Preview** | 미리보기 | 실시간으로 렌더링된 슬라이드 확인 | Live Preview, Real-time View |
| **Export** | 내보내기 | PDF 또는 HTML 파일로 저장 | Download, Save As |

---

## Global Standards (업계 표준 용어)

| Term | Definition | Reference |
|------|------------|-----------|
| **Markdown** | 경량 마크업 언어 (`.md` 파일 형식) | [CommonMark Spec](https://commonmark.org/) |
| **reveal.js** | HTML 프레젠테이션 프레임워크 | [revealjs.com](https://revealjs.com/) |
| **SSG** | Static Site Generation (정적 사이트 생성) | Next.js, Gatsby |
| **PDF Export** | 브라우저 인쇄 API를 통한 PDF 생성 | Browser Print API |
| **Debounce** | 연속 이벤트 제어 기법 (마지막 호출만 실행) | lodash.debounce |
| **CSS Variables** | CSS 커스텀 속성 (`:root` 레벨 변수) | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) |
| **TypeScript** | JavaScript의 정적 타입 언어 | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Zustand** | 경량 React 상태 관리 라이브러리 | [zustand](https://github.com/pmndrs/zustand) |
| **Tailwind CSS** | 유틸리티 우선 CSS 프레임워크 | [tailwindcss.com](https://tailwindcss.com/) |

---

## reveal.js Specific Terms (reveal.js 전용 용어)

| reveal.js Term | 프로젝트 매핑 | 설명 |
|----------------|--------------|------|
| `<section>` | `Slide` | HTML `<section>` 태그 = 슬라이드 1개 |
| Horizontal Slide | `type: 'horizontal'` | 좌우 이동 슬라이드 (`---` 구분) |
| Vertical Slide | `type: 'vertical'` | 상하 이동 슬라이드 (`-----` 구분) |
| `data-markdown` | Markdown 속성 | 마크다운 로드 속성 |
| `data-separator` | Separator 정규식 | 수평 슬라이드 구분 패턴 |
| `data-separator-vertical` | Vertical Separator | 수직 슬라이드 구분 패턴 |
| `data-separator-notes` | Notes Separator | 발표자 노트 구분 패턴 |
| `Reveal.initialize()` | 초기화 함수 | reveal.js 초기 설정 |
| `?print-pdf` | PDF 모드 | PDF 내보내기 URL 파라미터 |

---

## Term Mapping Table (용어 대응표)

| 한국어 | 영어 (코드) | reveal.js | 설명 |
|-------|------------|-----------|------|
| 슬라이드 | `Slide` | `<section>` | 단일 화면 |
| 덱 | `Deck` | Presentation | 전체 묶음 |
| 수평 슬라이드 | `horizontal` | Horizontal Slide | 좌우 이동 (`---`) |
| 수직 슬라이드 | `vertical` | Vertical Slide | 상하 이동 (`-----`) |
| 테마 | `Theme` | Theme | 디자인 스타일 |
| 구분자 | `separator` | `data-separator` | 슬라이드 나눔 문자 |
| 발표자 노트 | `notes` | Speaker Notes | 메모 |
| 내보내기 | `export` | Export | PDF/HTML 저장 |

---

## Term Usage Rules (용어 사용 규칙)

### 1. 코드에서는 영어 사용
```typescript
// ✅ Good
interface Slide {
  id: string;
  content: string;
}

const horizontalSlide: Slide = { ... };

// ❌ Bad
interface 슬라이드 {
  아이디: string;
}
```

### 2. UI/문서에서는 한국어 사용
```tsx
// ✅ Good (UI)
<button>슬라이드 추가</button>
<h1>테마 선택</h1>

// README.md
## 사용법
1. 마크다운 입력
2. 테마 선택
3. PDF로 내보내기
```

### 3. API 응답은 영어 (Global Standards)
```json
{
  "deck": {
    "id": "deck-001",
    "title": "My Presentation",
    "slides": [...]
  }
}
```

### 4. 타입 정의 시 명확성 우선
```typescript
// ✅ Good - 명확함
SlideConfig
ThemeOptions
ExportSettings

// ❌ Bad - 모호함
Config
Options
Settings
```

### 5. 약어 최소화
```typescript
// ✅ Good
configuration
message
reference

// ❌ Bad
cfg
msg
ref
```

---

## Ambiguous Terms (혼동 주의 용어)

| Term | ⚠️ 혼동 가능한 의미 | 프로젝트에서의 의미 |
|------|------------------|------------------|
| **Page** | 웹 페이지 vs 슬라이드 | ❌ 사용 금지 → `Slide` 사용 |
| **Screen** | 화면 vs 슬라이드 | ❌ 사용 금지 → `Slide` 사용 |
| **Document** | 문서 vs 덱 | ❌ 사용 금지 → `Deck` 사용 |
| **Style** | CSS vs 테마 | ⚠️ 주의 → `Theme` 또는 `CSS` 명시 |
| **Section** | HTML `<section>` vs 슬라이드 그룹 | ✅ `Section` = 슬라이드 그룹 (reveal.js 맥락) |

---

## Claude Code Auto-Reference Setup

이 용어집을 Claude Code가 자동으로 참조하도록 설정:

### 방법 1: CLAUDE.md에 포함
```markdown
<!-- CLAUDE.md -->
## 용어 참조
이 프로젝트의 용어 정의는 `docs/01-plan/glossary.md`를 참고하세요.

**핵심 용어:**
- Slide (슬라이드): 단일 화면
- Deck (덱): 전체 프레젠테이션
- Section (섹션): 슬라이드 그룹
- Theme (테마): 디자인 스타일
```

### 방법 2: 개발 가이드에 명시
```markdown
<!-- docs/DEVELOPMENT.md -->
## 용어 사용 가이드
- 코드: 영어 (`Slide`, `Theme`)
- UI: 한국어 ("슬라이드", "테마")
- 상세 정의: `docs/01-plan/glossary.md` 참조
```

---

## References (참고 문서)

- [reveal.js 공식 문서](https://revealjs.com/)
- [reveal.js Markdown 가이드](https://revealjs.com/markdown/)
- [CommonMark Spec](https://commonmark.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-04 | Initial glossary | Claude Code |
