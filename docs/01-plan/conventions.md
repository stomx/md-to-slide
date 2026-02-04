# Coding Conventions

> Phase 2 Deliverable: md-to-slide 프로젝트 코딩 규칙 정의

**Project**: md-to-slide
**Date**: 2026-02-04
**Version**: 1.0
**Level**: Starter

---

## 1. Naming Conventions (네이밍 규칙)

### 1.1 Files/Folders (파일/폴더)

| Target | Rule | Example | 설명 |
|--------|------|---------|------|
| **Component files** | PascalCase | `MarkdownEditor.tsx` | React 컴포넌트 파일 |
| **Utility files** | camelCase | `markdownParser.ts` | 유틸리티 함수 파일 |
| **Type files** | camelCase | `slide.types.ts` | 타입 정의 파일 |
| **Folders** | kebab-case | `markdown-editor/` | 모든 폴더 |
| **Constant files** | camelCase | `themes.ts` | 상수 모음 파일 |
| **Hook files** | camelCase | `useSlideState.ts` | Custom Hook |
| **Store files** | kebab-case | `slide-store.ts` | Zustand 스토어 |

**Examples:**
```
src/
├── components/
│   ├── MarkdownEditor.tsx          # PascalCase (Component)
│   ├── SlidePreview.tsx
│   └── ThemeSelector.tsx
├── lib/
│   ├── markdownParser.ts           # camelCase (Utility)
│   ├── themeManager.ts
│   └── exportHelper.ts
├── types/
│   └── slide.types.ts              # camelCase (Types)
├── store/
│   └── slide-store.ts              # kebab-case (Store)
└── hooks/
    └── useSlideState.ts            # camelCase (Hook)
```

### 1.2 Code (코드 내부)

| Target | Rule | Example | 설명 |
|--------|------|---------|------|
| **Components** | PascalCase | `MarkdownEditor` | React 컴포넌트 |
| **Functions** | camelCase | `parseMarkdown` | 일반 함수 |
| **Variables** | camelCase | `slideContent` | 변수 |
| **Constants** | UPPER_SNAKE_CASE | `DEFAULT_THEME` | 상수 |
| **Types/Interfaces** | PascalCase | `SlideConfig` | 타입/인터페이스 |
| **Enum** | PascalCase | `ThemeName` | Enum |
| **Boolean variables** | is/has prefix | `isLoading`, `hasError` | boolean 변수 |
| **Event handlers** | handle prefix | `handleSave`, `handleExport` | 이벤트 핸들러 |

**Examples:**
```typescript
// Components
export function MarkdownEditor({ markdown }: Props) { }

// Functions
function parseMarkdown(content: string): Slide[] { }

// Variables
const slideContent = markdown.split('---')
const isLoading = false

// Constants
const DEFAULT_THEME = 'black'
const MAX_SLIDES = 100

// Types
interface SlideConfig {
  theme: string
  transition: string
}

// Enums
enum ThemeName {
  Black = 'black',
  White = 'white',
  League = 'league'
}

// Event handlers
const handleSave = () => { }
const handleExport = () => { }
```

### 1.3 특수 네이밍 규칙

#### reveal.js 관련 용어
```typescript
// ✅ Good - 영어 사용 (코드)
interface Slide {
  content: string
  type: 'horizontal' | 'vertical'
}

const horizontalSlides = slides.filter(s => s.type === 'horizontal')

// ❌ Bad - 한국어 사용 금지
interface 슬라이드 {
  내용: string
}
```

#### 파일명 예외
```
public/
├── sample.md                # 샘플 마크다운 (소문자)
├── reveal.js/               # 외부 라이브러리 (원본 유지)
└── themes/
    └── custom-theme.css     # CSS 파일 (kebab-case)
```

---

## 2. Folder Structure (폴더 구조)

### 2.1 Starter Level 구조

```
md-to-slide/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # 메인 에디터 페이지
│   │   ├── layout.tsx            # 전역 레이아웃
│   │   ├── globals.css           # Tailwind CSS
│   │   └── favicon.ico
│   │
│   ├── components/               # UI 컴포넌트
│   │   ├── MarkdownEditor.tsx    # 마크다운 입력 에디터
│   │   ├── SlidePreview.tsx      # 슬라이드 미리보기
│   │   ├── ThemeSelector.tsx     # 테마 선택 드롭다운
│   │   ├── ExportButtons.tsx     # PDF/HTML 내보내기 버튼
│   │   └── ui/                   # 재사용 UI 컴포넌트
│   │       ├── Button.tsx
│   │       ├── Select.tsx
│   │       └── Textarea.tsx
│   │
│   ├── lib/                      # 유틸리티 함수
│   │   ├── markdownParser.ts     # 마크다운 → Slide[] 변환
│   │   ├── themeManager.ts       # 테마 적용 로직
│   │   ├── exportHelper.ts       # PDF/HTML 내보내기
│   │   └── utils.ts              # 공통 유틸
│   │
│   ├── types/                    # TypeScript 타입
│   │   └── slide.types.ts        # Slide, Deck, Theme 등
│   │
│   ├── store/                    # Zustand 상태 관리
│   │   └── slide-store.ts        # 전역 상태 (markdown, theme 등)
│   │
│   └── constants/                # 상수
│       ├── themes.ts             # 12개 테마 정의
│       ├── separators.ts         # 마크다운 구분자
│       └── defaults.ts           # 기본값
│
├── public/
│   ├── reveal.js/                # reveal.js 라이브러리 (로컬)
│   │   ├── dist/
│   │   └── plugin/
│   ├── themes/                   # 커스텀 테마 CSS
│   └── sample.md                 # 샘플 마크다운
│
├── docs/                         # 프로젝트 문서
│   └── 01-plan/
│       ├── features/
│       ├── schema.md
│       ├── glossary.md
│       └── conventions.md (이 파일)
│
├── .env.example                  # 환경 변수 템플릿
├── .env.local                    # 로컬 환경 변수 (Git 무시)
├── .eslintrc.json                # ESLint 설정
├── .prettierrc                   # Prettier 설정
├── .gitignore
├── next.config.js                # Next.js 설정
├── tailwind.config.ts            # Tailwind CSS 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json
└── README.md
```

### 2.2 폴더별 역할

| Folder | Purpose | Examples |
|--------|---------|----------|
| `src/app/` | Next.js App Router 페이지 | `page.tsx`, `layout.tsx` |
| `src/components/` | 재사용 가능한 UI 컴포넌트 | `MarkdownEditor.tsx` |
| `src/lib/` | 비즈니스 로직, 유틸리티 | `markdownParser.ts` |
| `src/types/` | 타입 정의 | `slide.types.ts` |
| `src/store/` | 전역 상태 관리 | `slide-store.ts` |
| `src/constants/` | 상수 정의 | `themes.ts` |
| `public/` | 정적 파일 (이미지, 외부 라이브러리) | `reveal.js/`, `sample.md` |

### 2.3 파일 배치 기준

```typescript
// ✅ Good - lib/에 비즈니스 로직
// lib/markdownParser.ts
export function parseMarkdown(content: string): Slide[] {
  // 파싱 로직
}

// ✅ Good - components/에 UI
// components/MarkdownEditor.tsx
export function MarkdownEditor() {
  const { markdown, setMarkdown } = useSlideStore()
  return <textarea value={markdown} onChange={...} />
}

// ❌ Bad - 컴포넌트에 비즈니스 로직 직접 작성
export function MarkdownEditor() {
  const slides = markdown.split('---').map(...)  // ❌ 파싱 로직이 컴포넌트 안에
}
```

---

## 3. Code Style (코드 스타일)

### 3.1 General (일반 규칙)

```typescript
// Indentation: 2 spaces (탭 아님)
function example() {
  if (condition) {
    doSomething()
  }
}

// Quotes: Single quotes (')
const message = 'Hello, World!'
import { Slide } from './types'

// Semicolons: 사용 안 함
const value = 42
const result = getValue()
```

### 3.2 Functions (함수)

```typescript
// ✅ Preferred: Arrow functions (유틸리티)
const parseMarkdown = (content: string): Slide[] => {
  return content.split('---').map(...)
}

const handleClick = () => {
  console.log('Clicked')
}

// ✅ Components: function declaration
export function MarkdownEditor({ markdown }: Props) {
  return <textarea value={markdown} />
}

// ✅ Named export (default export 지양)
export function parseMarkdown() { }
export { MarkdownEditor }

// ❌ Avoid: default export
export default function MarkdownEditor() { }  // ❌
```

### 3.3 Import Order (import 순서)

```typescript
// 1. React core
import { useState, useEffect } from 'react'

// 2. External libraries (알파벳 순)
import { marked } from 'marked'
import { create } from 'zustand'

// 3. Internal modules (absolute paths)
import { Button } from '@/components/ui/Button'
import { parseMarkdown } from '@/lib/markdownParser'
import { useSlideStore } from '@/store/slide-store'

// 4. Relative paths
import { SomeComponent } from './SomeComponent'

// 5. Types (import type)
import type { Slide, Theme } from '@/types/slide.types'

// 6. Styles (마지막)
import './styles.css'
```

### 3.4 TypeScript Rules

```typescript
// ✅ Good - 명시적 타입
interface MarkdownEditorProps {
  markdown: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ markdown, onChange }: MarkdownEditorProps) {
  // ...
}

// ✅ Good - 반환 타입 명시 (복잡한 함수)
function parseMarkdown(content: string): Slide[] {
  return content.split('---').map(...)
}

// ⚠️ OK - 간단한 함수는 타입 추론
const add = (a: number, b: number) => a + b  // 반환 타입 자동 추론

// ❌ Bad - any 사용 금지
function parseMarkdown(content: any): any {  // ❌
  // ...
}
```

---

## 4. Component Rules (컴포넌트 규칙)

### 4.1 Component Structure (컴포넌트 구조)

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Slide } from '@/types/slide.types'

// 2. Type definitions
interface MarkdownEditorProps {
  markdown: string
  onChange: (value: string) => void
}

// 3. Constants (컴포넌트 외부)
const DEBOUNCE_DELAY = 300

// 4. Component
export function MarkdownEditor({ markdown, onChange }: MarkdownEditorProps) {
  const [value, setValue] = useState(markdown)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div className="editor">
      <textarea value={value} onChange={handleChange} />
    </div>
  )
}

// 5. Exports (이미 위에서 export했으면 생략)
```

### 4.2 Props Naming

```typescript
// ✅ Good - 명확한 Props 이름
interface SlidePreviewProps {
  slides: Slide[]
  currentIndex: number
  onSlideChange: (index: number) => void
}

// ❌ Bad - 모호한 이름
interface Props {
  data: any  // ❌ 뭐가 data?
  cb: Function  // ❌ cb가 뭐지?
}
```

### 4.3 Event Handlers

```typescript
// ✅ Good - handle prefix
const handleSave = () => { }
const handleExport = () => { }
const handleThemeChange = (theme: string) => { }

// ✅ Good - Props에서는 on prefix
interface Props {
  onSave?: () => void
  onExport?: () => void
  onThemeChange?: (theme: string) => void
}

// Usage
<Button onClick={handleSave} />
<ThemeSelector onThemeChange={handleThemeChange} />
```

### 4.4 Conditional Rendering

```typescript
// ✅ Good - Early return
export function SlidePreview({ slides }: Props) {
  if (slides.length === 0) {
    return <div>No slides</div>
  }

  return (
    <div>
      {slides.map(slide => <Slide key={slide.id} {...slide} />)}
    </div>
  )
}

// ❌ Bad - 중첩된 조건문
export function SlidePreview({ slides }: Props) {
  return (
    <div>
      {slides.length > 0 ? (
        <div>
          {slides.map(slide => <Slide key={slide.id} {...slide} />)}
        </div>
      ) : (
        <div>No slides</div>
      )}
    </div>
  )
}
```

---

## 5. Environment Variable Conventions (환경 변수 규칙)

### 5.1 Naming Rules (네이밍 규칙)

| Prefix | Purpose | Exposure Scope | Example |
|--------|---------|----------------|---------|
| `NEXT_PUBLIC_` | 클라이언트 노출 가능 | Browser | `NEXT_PUBLIC_REVEAL_CDN` |

**주의:** Starter 레벨이므로 환경 변수 최소화 (백엔드 없음)

### 5.2 .env File Structure

```
md-to-slide/
├── .env.example        # Template (Git 포함, 값은 비움)
└── .env.local          # Local development (Git 무시)
```

### 5.3 .env.example Template

```bash
# .env.example - This file is included in Git
# Set actual values in .env.local

# ===== App Settings =====
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===== reveal.js CDN (Fallback) =====
NEXT_PUBLIC_REVEAL_CDN=https://cdn.jsdelivr.net/npm/reveal.js@5.0.4
```

### 5.4 Environment Variable Validation

```typescript
// lib/env.ts (선택 사항)
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_REVEAL_CDN: z.string().url().optional(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_REVEAL_CDN: process.env.NEXT_PUBLIC_REVEAL_CDN,
})
```

---

## 6. Clean Architecture (Starter Level)

### 6.1 Layer Structure

Starter 레벨은 **단순 구조** 사용:

```
src/
├── components/     # Presentation Layer (UI)
├── lib/            # Application Layer (비즈니스 로직)
├── types/          # Domain Layer (타입 정의)
└── store/          # Application Layer (상태 관리)
```

### 6.2 Dependency Rules (의존성 규칙)

```typescript
// ✅ Good - components/ → lib/ (Presentation → Application)
// components/MarkdownEditor.tsx
import { parseMarkdown } from '@/lib/markdownParser'

export function MarkdownEditor() {
  const slides = parseMarkdown(markdown)  // ✅ lib 함수 사용
}

// ✅ Good - lib/ → types/ (Application → Domain)
// lib/markdownParser.ts
import type { Slide } from '@/types/slide.types'

export function parseMarkdown(content: string): Slide[] {
  // ...
}

// ❌ Bad - lib/ → components/ (역방향 의존)
// lib/markdownParser.ts
import { MarkdownEditor } from '@/components/MarkdownEditor'  // ❌

// ❌ Bad - types/ → lib/ (Domain이 Application에 의존)
// types/slide.types.ts
import { parseMarkdown } from '@/lib/markdownParser'  // ❌
```

**의존성 방향:**
```
components/ → lib/ → types/
           ↘      ↗
             store/
```

### 6.3 File Separation (파일 분리 기준)

```typescript
// ✅ Good - 비즈니스 로직은 lib/
// lib/markdownParser.ts
export function parseMarkdown(content: string): Slide[] {
  const separator = /\r?\n---\r?\n/
  return content.split(separator).map((section, index) => ({
    id: `slide-${index}`,
    content: section.trim(),
    order: index,
    type: 'horizontal'
  }))
}

// ✅ Good - UI 로직은 components/
// components/MarkdownEditor.tsx
export function MarkdownEditor() {
  const { markdown, setMarkdown } = useSlideStore()
  const slides = parseMarkdown(markdown)  // lib 함수 호출

  return (
    <div>
      <textarea value={markdown} onChange={e => setMarkdown(e.target.value)} />
      <div>Slides: {slides.length}</div>
    </div>
  )
}
```

---

## 7. ESLint & Prettier Configuration

### 7.1 .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "semi": ["error", "never"],
    "quotes": ["error", "single"],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "arrow-body-style": ["error", "as-needed"]
  }
}
```

### 7.2 .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### 7.3 .gitignore

```
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/
build/
dist/

# environment variables
.env
.env.local
.env.*.local

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# misc
.DS_Store
*.pem

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

## 8. Validation Checklist (검증 체크리스트)

### Naming/Structure
- [x] 파일/폴더 네이밍 규칙 명확
- [x] 컴포넌트/함수 네이밍 규칙 명확
- [x] 폴더 구조 정의 완료
- [x] ESLint/Prettier 설정 정의

### Environment Variables
- [x] .env.example 작성 완료
- [x] 환경 변수 네이밍 규칙 준수
- [x] Git 무시 목록 확인 (.env.local)

### Architecture
- [x] Starter 레벨 구조 선택
- [x] 의존성 방향 규칙 정의
- [x] 파일 분리 기준 명확

---

## 9. Code Quality Rules (코드 품질 규칙)

### 9.1 Reusability (재사용성)

```typescript
// ✅ Good - 제네릭 함수
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Usage
const debouncedSave = debounce(handleSave, 300)
const debouncedExport = debounce(handleExport, 500)
```

### 9.2 Avoid Duplication (중복 방지)

```typescript
// ❌ Bad - 중복 코드
const pdfConfig = {
  format: 'pdf',
  filename: 'presentation.pdf',
  includeNotes: true
}

const htmlConfig = {
  format: 'html',
  filename: 'presentation.html',
  embedAssets: true
}

// ✅ Good - Factory 함수
function createExportConfig(format: 'pdf' | 'html'): ExportConfig {
  const base = {
    format,
    filename: `presentation.${format}`
  }

  return format === 'pdf'
    ? { ...base, includeNotes: true }
    : { ...base, embedAssets: true }
}
```

### 9.3 Error Handling (에러 처리)

```typescript
// ✅ Good - try-catch + 사용자 친화적 메시지
async function exportToPDF(slides: Slide[]) {
  try {
    const pdf = await generatePDF(slides)
    download(pdf, 'presentation.pdf')
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('PDF 내보내기에 실패했습니다. 다시 시도해주세요.')
  }
}

// ❌ Bad - 에러 무시
async function exportToPDF(slides: Slide[]) {
  const pdf = await generatePDF(slides)  // 에러 처리 없음
  download(pdf, 'presentation.pdf')
}
```

---

## 10. Next Steps (다음 단계)

Convention 정의가 완료되었습니다!

**다음 단계:**
1. `/pdca design md-to-slide-core` - Design 문서 작성
2. Phase 3: Mockup (선택 사항)
3. 프로젝트 초기화 (Next.js + reveal.js)

**설정 파일 생성:**
- `.eslintrc.json`
- `.prettierrc`
- `.env.example`
- `.gitignore`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-04 | Initial conventions | Claude Code |
