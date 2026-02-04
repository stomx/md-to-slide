# Schema Definition

> Phase 1 Deliverable: md-to-slide 프로젝트 데이터 구조 정의

**Project**: md-to-slide
**Date**: 2026-02-04
**Version**: 1.0

---

## 1. Terminology Definition (용어 정의)

### 1.1 Business Terms (프로젝트 전용 용어)

| Term | Korean | Definition | Global Standard Mapping |
|------|--------|------------|------------------------|
| **Slide** | 슬라이드 | reveal.js로 렌더링되는 단일 화면 단위 | Page, Screen |
| **Deck** | 덱 | 전체 슬라이드 묶음 (프레젠테이션 단위) | Presentation, Slideshow |
| **Section** | 섹션 | 슬라이드 그룹 (수평/수직 구조) | Group, Collection |
| **Theme** | 테마 | 슬라이드 디자인 스타일 (색상, 폰트 등) | Style, Skin |
| **Separator** | 구분자 | 마크다운에서 슬라이드를 나누는 문자열 | Delimiter, Divider |
| **Fragment** | 프래그먼트 | 슬라이드 내 단계적 등장 요소 | Step, Incremental Element |

### 1.2 Global Standards (업계 표준 용어)

| Term | Definition | Reference |
|------|------------|-----------|
| **Markdown** | 경량 마크업 언어 | CommonMark Spec |
| **reveal.js** | HTML 프레젠테이션 프레임워크 | https://revealjs.com |
| **SSG** | Static Site Generation (정적 사이트 생성) | Next.js, Gatsby |
| **PDF Export** | 브라우저 인쇄 API를 통한 PDF 생성 | Browser Print API |
| **Debounce** | 연속 이벤트 제어 기법 (마지막 호출만 실행) | lodash.debounce |

### 1.3 Term Usage Rules

1. **코드에서는 영어 사용**: `Slide`, `Theme`, `Deck`
2. **UI/문서에서는 한국어**: "슬라이드", "테마", "덱"
3. **타입 정의 시 명확성 우선**: `SlideConfig`, `ThemeOptions`
4. **약어 최소화**: `config` ✅, `cfg` ❌

---

## 2. Entity List (엔티티 목록)

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| **Slide** | 단일 슬라이드 | id, content, order, type |
| **Deck** | 슬라이드 묶음 | id, title, slides, theme, metadata |
| **Theme** | 테마 설정 | name, cssVariables, builtIn |
| **Section** | 슬라이드 섹션 (수평/수직) | id, slides, orientation |
| **ExportConfig** | 내보내기 설정 | format, options, filename |
| **EditorState** | 에디터 상태 | markdown, cursorPosition, lastSaved |

---

## 3. Entity Details (엔티티 상세)

### 3.1 Slide (슬라이드)

**Description**: reveal.js로 렌더링되는 단일 화면 단위. 마크다운 구분자(`---`, `-----`)로 분리됨.

**Attributes**:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Y | 고유 식별자 (UUID) |
| `content` | `string` | Y | 마크다운 원본 텍스트 |
| `html` | `string` | N | 파싱된 HTML (캐시용) |
| `order` | `number` | Y | 슬라이드 순서 (0부터 시작) |
| `type` | `'horizontal' \| 'vertical'` | Y | 수평/수직 슬라이드 구분 |
| `sectionId` | `string` | N | 소속 섹션 ID |
| `notes` | `string` | N | 발표자 노트 |
| `background` | `string` | N | 배경 이미지/색상 URL |
| `transition` | `string` | N | 전환 효과 (`slide`, `fade`, `zoom` 등) |

**Relationships**:
- N:1 → `Section` (하나의 섹션에 속함)
- N:1 → `Deck` (하나의 덱에 속함)

**Example**:
```typescript
const slide: Slide = {
  id: 'slide-001',
  content: '# Welcome\n\nThis is my first slide',
  html: '<h1>Welcome</h1><p>This is my first slide</p>',
  order: 0,
  type: 'horizontal',
  sectionId: 'section-001',
  notes: 'Remember to smile!',
  background: null,
  transition: 'slide'
};
```

---

### 3.2 Deck (덱)

**Description**: 전체 프레젠테이션 단위. 여러 슬라이드와 메타데이터를 포함.

**Attributes**:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Y | 덱 고유 식별자 |
| `title` | `string` | Y | 프레젠테이션 제목 |
| `slides` | `Slide[]` | Y | 포함된 슬라이드 배열 |
| `sections` | `Section[]` | N | 슬라이드 그룹 (수평/수직 구조) |
| `theme` | `Theme` | Y | 적용된 테마 |
| `metadata` | `DeckMetadata` | N | 작성자, 생성일 등 메타데이터 |
| `revealConfig` | `RevealConfig` | N | reveal.js 초기화 옵션 |

**Relationships**:
- 1:N → `Slide` (여러 슬라이드 포함)
- 1:N → `Section` (여러 섹션 포함)
- 1:1 → `Theme` (하나의 테마 적용)

**Example**:
```typescript
const deck: Deck = {
  id: 'deck-001',
  title: 'My Awesome Presentation',
  slides: [slide1, slide2, slide3],
  sections: [section1, section2],
  theme: blackTheme,
  metadata: {
    author: 'John Doe',
    createdAt: '2026-02-04T12:00:00Z',
    version: '1.0'
  },
  revealConfig: {
    controls: true,
    progress: true,
    hash: true
  }
};
```

---

### 3.3 Theme (테마)

**Description**: 슬라이드 디자인 스타일 (색상, 폰트, 레이아웃 등).

**Attributes**:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Y | 테마 이름 (`black`, `white`, `league` 등) |
| `displayName` | `string` | Y | UI 표시 이름 (한국어 가능) |
| `builtIn` | `boolean` | Y | reveal.js 기본 테마 여부 |
| `cssUrl` | `string` | Y | CSS 파일 경로 또는 CDN URL |
| `cssVariables` | `Record<string, string>` | N | CSS 커스텀 변수 (`:root` 오버라이드) |
| `preview` | `string` | N | 테마 미리보기 이미지 URL |

**Relationships**:
- 1:N → `Deck` (여러 덱에서 재사용 가능)

**Example**:
```typescript
const blackTheme: Theme = {
  name: 'black',
  displayName: '블랙',
  builtIn: true,
  cssUrl: '/reveal.js/dist/theme/black.css',
  cssVariables: {
    '--r-background-color': '#191919',
    '--r-main-color': '#fff',
    '--r-heading-color': '#fff'
  },
  preview: '/themes/previews/black.png'
};

const customTheme: Theme = {
  name: 'my-custom',
  displayName: '커스텀 테마',
  builtIn: false,
  cssUrl: '/themes/my-custom.css',
  cssVariables: {
    '--r-background-color': '#f0f0f0',
    '--r-main-color': '#333'
  },
  preview: null
};
```

---

### 3.4 Section (섹션)

**Description**: 슬라이드 그룹. reveal.js의 수평/수직 계층 구조 표현.

**Attributes**:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Y | 섹션 고유 식별자 |
| `slides` | `Slide[]` | Y | 포함된 슬라이드 배열 |
| `orientation` | `'horizontal' \| 'vertical'` | Y | 방향 (수평/수직) |
| `parentSectionId` | `string` | N | 부모 섹션 ID (수직 섹션의 경우) |
| `order` | `number` | Y | 섹션 순서 |

**Relationships**:
- 1:N → `Slide` (여러 슬라이드 포함)
- N:1 → `Section` (수직 섹션은 수평 섹션에 속함)

**Example**:
```typescript
// 수평 섹션
const horizontalSection: Section = {
  id: 'section-001',
  slides: [slide1, slide2],
  orientation: 'horizontal',
  parentSectionId: null,
  order: 0
};

// 수직 섹션 (수평 섹션 내부)
const verticalSection: Section = {
  id: 'section-002',
  slides: [slide3, slide4],
  orientation: 'vertical',
  parentSectionId: 'section-001',
  order: 1
};
```

---

### 3.5 ExportConfig (내보내기 설정)

**Description**: PDF/HTML 내보내기 시 사용되는 설정.

**Attributes**:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | `'pdf' \| 'html'` | Y | 내보내기 형식 |
| `filename` | `string` | Y | 저장 파일명 |
| `includeNotes` | `boolean` | N | 발표자 노트 포함 여부 (PDF) |
| `separateFragments` | `boolean` | N | Fragment를 별도 페이지로 분리 (PDF) |
| `embedAssets` | `boolean` | N | 이미지/폰트 임베드 (HTML) |
| `revealJsMode` | `'cdn' \| 'local'` | N | reveal.js 로드 방식 (HTML) |

**Relationships**: 없음 (독립 설정 객체)

**Example**:
```typescript
const pdfConfig: ExportConfig = {
  format: 'pdf',
  filename: 'presentation.pdf',
  includeNotes: true,
  separateFragments: false
};

const htmlConfig: ExportConfig = {
  format: 'html',
  filename: 'presentation.html',
  embedAssets: true,
  revealJsMode: 'local'
};
```

---

### 3.6 EditorState (에디터 상태)

**Description**: 마크다운 에디터의 현재 상태 (Zustand 스토어에서 관리).

**Attributes**:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `markdown` | `string` | Y | 사용자가 입력한 마크다운 원본 |
| `cursorPosition` | `number` | N | 커서 위치 (문자 인덱스) |
| `lastSaved` | `Date` | N | 마지막 저장 시각 |
| `isDirty` | `boolean` | Y | 저장되지 않은 변경사항 여부 |
| `selectedTheme` | `string` | Y | 현재 선택된 테마 이름 |

**Relationships**:
- 1:1 → `Deck` (현재 편집 중인 덱)

**Example**:
```typescript
const editorState: EditorState = {
  markdown: '# Slide 1\n\n---\n\n# Slide 2',
  cursorPosition: 15,
  lastSaved: new Date('2026-02-04T12:00:00Z'),
  isDirty: true,
  selectedTheme: 'black'
};
```

---

## 4. Entity Relationship Diagram (ERD)

```
┌──────────────┐
│     Deck     │
│ (덱)         │
├──────────────┤
│ id           │
│ title        │
│ slides[]     │
│ sections[]   │
│ theme        │
│ metadata     │
└──────┬───────┘
       │
       │ 1:N
       ↓
┌──────────────┐         ┌──────────────┐
│   Section    │ 1:N     │    Slide     │
│ (섹션)       │────────→│ (슬라이드)    │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ orientation  │         │ content      │
│ slides[]     │         │ html         │
│ order        │         │ order        │
└──────────────┘         │ type         │
                         │ sectionId    │
                         │ notes        │
                         └──────────────┘

┌──────────────┐
│    Theme     │
│ (테마)       │
├──────────────┤
│ name         │
│ displayName  │
│ builtIn      │
│ cssUrl       │
│ cssVariables │
└──────┬───────┘
       │
       │ 1:N (재사용)
       ↓
┌──────────────┐
│     Deck     │
└──────────────┘

┌──────────────┐         ┌──────────────┐
│ EditorState  │         │ ExportConfig │
│ (에디터 상태) │         │ (내보내기)    │
├──────────────┤         ├──────────────┤
│ markdown     │         │ format       │
│ isDirty      │         │ filename     │
│ selectedTheme│         │ options      │
└──────────────┘         └──────────────┘
```

**관계 설명:**
- `Deck` 1:N `Slide` - 하나의 덱은 여러 슬라이드를 포함
- `Deck` 1:N `Section` - 하나의 덱은 여러 섹션을 포함
- `Section` 1:N `Slide` - 하나의 섹션은 여러 슬라이드를 포함
- `Deck` N:1 `Theme` - 여러 덱이 하나의 테마를 재사용 가능
- `Section` N:1 `Section` - 수직 섹션은 수평 섹션에 속함 (재귀 관계)

---

## 5. Data Flow (데이터 흐름)

### 5.1 마크다운 → 슬라이드 변환 흐름

```
┌──────────────┐
│ 사용자 입력   │
│ (Markdown)   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ EditorState  │ (Zustand Store)
│ markdown     │
└──────┬───────┘
       │
       ↓ (debounce 300ms)
┌──────────────┐
│ Parser       │ (lib/markdown-parser.ts)
│ marked.js    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Slide[]      │ (분리된 슬라이드 배열)
│ Section[]    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Deck         │ (완성된 덱 객체)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ reveal.js    │ (렌더링)
│ 미리보기     │
└──────────────┘
```

### 5.2 테마 적용 흐름

```
┌──────────────┐
│ Theme        │
│ Selector     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ EditorState  │
│ selectedTheme│
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ ThemeManager │ (lib/theme-manager.ts)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ <link> 태그  │ (CSS 동적 로드)
│ CSS Variables│ (:root 오버라이드)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ reveal.js    │ (재렌더링)
└──────────────┘
```

### 5.3 내보내기 흐름

```
┌──────────────┐
│ ExportConfig │
│ format: pdf  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Export Helper│ (lib/export-helper.ts)
└──────┬───────┘
       │
       ├─ PDF ─→ ?print-pdf 파라미터 추가 → window.print()
       │
       └─ HTML ─→ Deck + reveal.js 번들링 → Blob → download()
```

---

## 6. Validation Checklist

- [x] All core entities defined (Slide, Deck, Theme, Section, ExportConfig, EditorState)
- [x] Terms are clear and consistent (영어 코드, 한국어 UI)
- [x] Entity relationships are clear (1:N, N:1 명시)
- [x] No missing attributes (필수 속성 모두 정의)
- [x] Data flow documented (마크다운 → 슬라이드 → 렌더링)
- [x] reveal.js 용어와 매핑 완료 (Slide ↔ Section, Deck ↔ Presentation)

---

## 7. TypeScript Type Definitions (미리보기)

다음 단계(Phase 2 Convention)에서 `src/types/slide.types.ts`에 작성될 타입 정의 예시:

```typescript
// src/types/slide.types.ts

export type SlideType = 'horizontal' | 'vertical';
export type Orientation = 'horizontal' | 'vertical';
export type ExportFormat = 'pdf' | 'html';
export type RevealJsMode = 'cdn' | 'local';

export interface Slide {
  id: string;
  content: string;
  html?: string;
  order: number;
  type: SlideType;
  sectionId?: string;
  notes?: string;
  background?: string;
  transition?: string;
}

export interface Section {
  id: string;
  slides: Slide[];
  orientation: Orientation;
  parentSectionId?: string;
  order: number;
}

export interface Theme {
  name: string;
  displayName: string;
  builtIn: boolean;
  cssUrl: string;
  cssVariables?: Record<string, string>;
  preview?: string;
}

export interface DeckMetadata {
  author?: string;
  createdAt: string;
  version: string;
}

export interface RevealConfig {
  controls?: boolean;
  progress?: boolean;
  hash?: boolean;
  transition?: string;
  // ... reveal.js 초기화 옵션
}

export interface Deck {
  id: string;
  title: string;
  slides: Slide[];
  sections?: Section[];
  theme: Theme;
  metadata?: DeckMetadata;
  revealConfig?: RevealConfig;
}

export interface ExportConfig {
  format: ExportFormat;
  filename: string;
  includeNotes?: boolean;
  separateFragments?: boolean;
  embedAssets?: boolean;
  revealJsMode?: RevealJsMode;
}

export interface EditorState {
  markdown: string;
  cursorPosition?: number;
  lastSaved?: Date;
  isDirty: boolean;
  selectedTheme: string;
}
```

---

## 8. Next Steps

Phase 2: Coding Convention Definition

다음 단계에서 정의할 내용:
- [x] 파일/폴더 네이밍 규칙
- [x] 코딩 스타일 가이드 (ESLint, Prettier)
- [x] import 순서
- [x] 컴포넌트 작성 패턴
- [x] 에러 처리 패턴

**명령어**: `/bkit:phase-2-convention` 또는 `/pdca next`
