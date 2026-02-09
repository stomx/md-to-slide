# 요구사항정의서: Gen AI 슬라이드 자동 생성 기능

> **Product**: md-to-slide
> **Version**: 0.2.0
> **Date**: 2026-02-09
> **Status**: Draft
> **Related**: [PRD](./PRD.md) | [Plan](./features/apply-gen-ai-feature.plan.md) | [Design](../02-design/features/apply-gen-ai-feature.design.md)

---

## 1. 기능 요구사항 (Functional Requirements)

### FR-01: AI 슬라이드 생성

| 항목 | 내용 |
|------|------|
| **ID** | FR-01 |
| **우선순위** | High |
| **설명** | 사용자가 자연어 프롬프트를 입력하면, AI가 reveal.js 마크다운 형식의 슬라이드를 자동 생성한다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 1-1 | 텍스트 프롬프트 입력 (최대 1,000자) | Textarea에서 입력 가능, 글자 수 표시 |
| 1-2 | 2단계 파이프라인 (Planning → Generation) | Call 1: JSON 아웃라인 반환, Call 2: 마크다운 스트리밍 |
| 1-3 | reveal.js 마크다운 문법 준수 | `---` 수평 구분, `--` 수직 구분, 슬라이드 속성, Fragment, 노트 포함 |
| 1-4 | 생성 결과를 에디터에 반영 | 완료 시 slide-store의 markdown 상태 업데이트 |

**입력:**
- 자연어 프롬프트 (string, 1~1,000자)
- 생성 옵션 (슬라이드 수, 테마, 언어)

**출력:**
- PlanningResult (JSON): 분석, 전략, 아웃라인
- reveal.js 마크다운 (string): 슬라이드 전체 텍스트

---

### FR-02: 생성 옵션 설정

| 항목 | 내용 |
|------|------|
| **ID** | FR-02 |
| **우선순위** | High |
| **설명** | 슬라이드 생성 시 세부 옵션을 설정할 수 있다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 2-1 | 슬라이드 수 선택 | 5 / 8 / 12 / 자동(AI 판단) 중 택 1 |
| 2-2 | 테마 선택 | 기존 12개 reveal.js 테마에서 선택 |
| 2-3 | 언어 선택 | 한국어(ko) / 영어(en) 중 택 1 |
| 2-4 | 프롬프트 템플릿 선택 | 비즈니스 / 교육 / 기술 / 제안서 중 선택 (선택 사항) |

---

### FR-03: 스트리밍 실시간 생성

| 항목 | 내용 |
|------|------|
| **ID** | FR-03 |
| **우선순위** | High |
| **설명** | 슬라이드 생성 과정을 SSE 스트리밍으로 실시간 표시한다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 3-1 | SSE 스트리밍 연결 | `/api/ai/generate` 엔드포인트에서 `text/event-stream` 응답 |
| 3-2 | 마크다운 청크 실시간 표시 | `md_delta` 이벤트 수신 시 UI에 누적 표시 |
| 3-3 | 슬라이드 완성 알림 | `slide_complete` 이벤트로 진행률 업데이트 |
| 3-4 | 완료 메타데이터 | 전체 슬라이드 수, 소요 시간, 토큰 사용량 표시 |
| 3-5 | 생성 중단 | AbortController로 사용자가 생성을 중간에 취소 가능 |

**SSE 이벤트 종류:**

| 이벤트 | 데이터 | 발생 시점 |
|--------|--------|----------|
| `planning_start` | - | Planning 시작 |
| `planning_complete` | PlanningResult (JSON) | Planning 완료 |
| `generation_start` | - | 마크다운 생성 시작 |
| `md_delta` | content (string) | 마크다운 청크 생성 |
| `slide_complete` | slideNumber (number) | 슬라이드 1장 완성 |
| `complete` | markdown, metadata | 전체 생성 완료 |
| `error` | stage, message, retryable | 에러 발생 |

---

### FR-04: 아웃라인 편집

| 항목 | 내용 |
|------|------|
| **ID** | FR-04 |
| **우선순위** | High |
| **설명** | AI가 생성한 아웃라인을 사용자가 편집할 수 있다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 4-1 | 아웃라인 항목 제목 인라인 편집 | 클릭하여 직접 수정 |
| 4-2 | 핵심 포인트 편집 | 각 슬라이드의 keyPoints 수정 |
| 4-3 | 드래그앤드롭 순서 변경 | 슬라이드 순서를 드래그로 변경 |
| 4-4 | 항목 추가/삭제 | 슬라이드 추가 또는 삭제 버튼 |
| 4-5 | 아웃라인 재생성 | "재생성" 버튼으로 Call 1 재실행 |

---

### FR-05: reveal.js Markdown 플러그인 전환

| 항목 | 내용 |
|------|------|
| **ID** | FR-05 |
| **우선순위** | High |
| **설명** | 현재 `marked` + DOMPurify 파서를 reveal.js 네이티브 Markdown 플러그인으로 전환한다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 5-1 | RevealMarkdown 플러그인 로드 | `plugins: [RevealMarkdown]` 설정 |
| 5-2 | `data-markdown` 렌더링 | `<section data-markdown>` + `<script type="text/template">` 방식 |
| 5-3 | 수직 구분자 변경 | `-----` (5개) → `--` (2개) |
| 5-4 | 슬라이드 속성 지원 | `<!-- .slide: data-background="..." -->` 자동 처리 |
| 5-5 | Fragment 지원 | `<!-- .element: class="fragment" -->` 자동 처리 |
| 5-6 | 발표자 노트 지원 | `Notes:` 키워드 자동 처리 |
| 5-7 | 기존 기능 호환 | 기존 마크다운 슬라이드가 전환 후에도 정상 렌더링 |

---

### FR-06: PPTX 내보내기

| 항목 | 내용 |
|------|------|
| **ID** | FR-06 |
| **우선순위** | High |
| **설명** | reveal.js 슬라이드를 PPTX 파일로 변환하여 다운로드한다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 6-1 | PPTX 다운로드 버튼 | ExportButtons에 "PPTX" 버튼 추가 |
| 6-2 | 제목/텍스트 매핑 | h1~h6 → fontSize 차등, bold 처리 |
| 6-3 | 목록 매핑 | ul/ol → bullet 텍스트 |
| 6-4 | 배경색 매핑 | data-background → slide.background |
| 6-5 | 발표자 노트 매핑 | Notes → slide.addNotes() |
| 6-6 | 코드 블록 매핑 | pre/code → monospace 폰트 텍스트 |
| 6-7 | 수직 슬라이드 평탄화 | 수직 슬라이드를 수평으로 변환 |
| 6-8 | 호환성 | MS PowerPoint 2016+ 및 Google Slides에서 정상 열림 |

---

### FR-07: reveal.js 고급 문법 활용

| 항목 | 내용 |
|------|------|
| **ID** | FR-07 |
| **우선순위** | Medium |
| **설명** | AI가 생성하는 슬라이드에 reveal.js 고급 기능을 활용한다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 7-1 | 슬라이드별 배경색 적용 | 시스템 프롬프트에 배경색 가이드 포함 |
| 7-2 | 트랜지션 효과 적용 | slide / fade / zoom / convex 중 적절한 효과 |
| 7-3 | Fragment 순차 표시 | 핵심 포인트를 하나씩 표시 |
| 7-4 | 발표자 노트 자동 생성 | 각 슬라이드에 발표 가이드 노트 |
| 7-5 | 코드 하이라이팅 | 기술 발표 시 코드 블록에 언어 지정 |

---

### FR-08: 생성 이력 관리

| 항목 | 내용 |
|------|------|
| **ID** | FR-08 |
| **우선순위** | Low |
| **설명** | 이전 생성 이력을 localStorage에 저장하여 재사용한다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 8-1 | 생성 이력 저장 | 프롬프트, 옵션, 타임스탬프를 localStorage에 저장 |
| 8-2 | 최근 이력 표시 | Step 1에서 최근 5개 이력 표시 |
| 8-3 | 이력에서 재생성 | 이전 프롬프트/옵션으로 재생성 가능 |

---

### FR-09: 프롬프트 템플릿

| 항목 | 내용 |
|------|------|
| **ID** | FR-09 |
| **우선순위** | Medium |
| **설명** | 목적별 프롬프트 템플릿을 제공하여 생성 품질을 향상시킨다 |

**상세 요구사항:**

| # | 요구사항 | 수용 기준 |
|:-:|----------|----------|
| 9-1 | 4종 템플릿 제공 | 비즈니스, 교육, 기술, 제안서 |
| 9-2 | 템플릿 선택 UI | 카드 형태로 템플릿 선택 |
| 9-3 | 예시 프롬프트 표시 | 템플릿 선택 시 예시 프롬프트 자동 입력 |
| 9-4 | 프롬프트 접두어 적용 | 선택된 템플릿의 promptPrefix가 시스템 프롬프트에 추가 |

---

## 2. 비기능 요구사항 (Non-Functional Requirements)

### NFR-01: 성능

| # | 요구사항 | 측정 기준 | 목표치 |
|:-:|----------|----------|--------|
| 1 | 스트리밍 첫 토큰 응답 시간 (TTFT) | API 응답 측정 | < 1초 |
| 2 | 5장 슬라이드 전체 생성 시간 | E2E 측정 | < 15초 |
| 3 | 10장 슬라이드 전체 생성 시간 | E2E 측정 | < 30초 |
| 4 | PPTX 변환 시간 (10장 기준) | 클라이언트 측정 | < 3초 |
| 5 | AI Wizard 패널 열림 애니메이션 | 프레임 측정 | 60fps, < 300ms |

### NFR-02: 보안

| # | 요구사항 | 측정 기준 | 목표치 |
|:-:|----------|----------|--------|
| 1 | API Key 서버사이드 관리 | 코드 리뷰, 빌드 분석 | 클라이언트 번들에 API Key 미포함 |
| 2 | 환경변수 분리 | `.env` 검증 | `ANTHROPIC_API_KEY`에 `NEXT_PUBLIC_` 접두사 미사용 |
| 3 | 입력 검증 | API Route 검증 | 프롬프트 길이, 옵션 값 서버사이드 검증 |
| 4 | DOM 보안 | DOMPurify 적용 | AI 생성 마크다운 렌더링 시 XSS 방지 |

### NFR-03: 사용성 (UX)

| # | 요구사항 | 측정 기준 | 목표치 |
|:-:|----------|----------|--------|
| 1 | 생성 중 실시간 프리뷰 업데이트 | 수동 테스트 | 완성된 슬라이드 즉시 프리뷰 반영 |
| 2 | 생성 진행률 표시 | UI 확인 | 슬라이드별 완료 상태 + 전체 진행률 |
| 3 | 에러 메시지 명확성 | UX 테스트 | 사용자가 원인과 해결 방법을 이해 가능 |
| 4 | 반응형 지원 | 기기별 테스트 | 데스크톱: 3컬럼, 태블릿: 탭, 모바일: 전체화면 |

### NFR-04: 호환성

| # | 요구사항 | 측정 기준 | 목표치 |
|:-:|----------|----------|--------|
| 1 | PPTX 호환 | 수동 테스트 | MS PowerPoint 2016+ 정상 열림 |
| 2 | PPTX 호환 | 수동 테스트 | Google Slides 정상 열림 |
| 3 | 브라우저 지원 | 크로스 브라우저 테스트 | Chrome, Firefox, Safari, Edge 최신 버전 |
| 4 | 기존 기능 호환 | 회귀 테스트 | reveal.js 전환 후 기존 마크다운 정상 렌더링 |

### NFR-05: 비용

| # | 요구사항 | 측정 기준 | 목표치 |
|:-:|----------|----------|--------|
| 1 | 1회 생성 비용 | API 비용 측정 | < $0.05 (5장 기준) |
| 2 | Prompt Caching 적용 | 캐시 히트율 | 시스템 프롬프트 캐시 히트 |
| 3 | 불필요한 재생성 방지 | UX 설계 | 아웃라인 수정 시 Call 2만 재실행 |

### NFR-06: 안정성

| # | 요구사항 | 측정 기준 | 목표치 |
|:-:|----------|----------|--------|
| 1 | 네트워크 에러 자동 재시도 | 자동 테스트 | 최대 3회 exponential backoff |
| 2 | Rate limit 대응 | 에러 핸들링 | 대기 안내 메시지 + 자동 재시도 |
| 3 | 부분 결과 보존 | 수동 테스트 | 스트리밍 중 에러 시 생성된 부분까지 보존 |
| 4 | 생성 중단 지원 | 수동 테스트 | AbortController로 즉시 중단 |

---

## 3. 인터페이스 요구사항

### 3.1 외부 API

| API | 프로토콜 | 인증 | 용도 |
|-----|----------|------|------|
| Anthropic Messages API | HTTPS (POST) | `x-api-key` Header | 슬라이드 Planning + Generation |
| Anthropic Streaming API | HTTPS (SSE) | `x-api-key` Header | Generation 스트리밍 |

### 3.2 내부 API

| 엔드포인트 | 메서드 | 요청 | 응답 |
|-----------|--------|------|------|
| `/api/ai/generate` | POST | `{ action: 'plan', options }` | SSE: planning_start → planning_complete |
| `/api/ai/generate` | POST | `{ action: 'generate', outline, theme, language }` | SSE: generation_start → md_delta* → complete |

### 3.3 데이터 인터페이스

| 데이터 | 저장소 | 형식 |
|--------|--------|------|
| 생성 이력 | localStorage | `ai-generation-history` key, JSON array |
| AI 기능 활성화 | 환경변수 | `NEXT_PUBLIC_AI_ENABLED` (boolean string) |
| API Key | 서버 환경변수 | `ANTHROPIC_API_KEY` (서버 전용) |

---

## 4. 제약사항

| # | 제약사항 | 영향 |
|:-:|----------|------|
| 1 | Anthropic API Key 필요 (유료) | AI 기능은 API Key 설정 시에만 활성화 |
| 2 | 서버사이드 실행 필요 | 정적 배포(GitHub Pages 등) 불가, Vercel/Node.js 서버 필요 |
| 3 | 이미지 생성 미지원 | 텍스트 기반 슬라이드만 자동 생성 |
| 4 | 단일 AI Provider | 초기 버전은 Anthropic만 지원 |
| 5 | 오프라인 미지원 | AI 생성은 네트워크 필요 |

---

## 5. 추적성 매트릭스

| 요구사항 | Plan 참조 | Design 참조 | 구현 파일 |
|----------|-----------|-------------|----------|
| FR-01 | Plan 3.1 FR-01 | Design 3 (API), 4 (Prompt) | route.ts, prompts.ts, pipeline.ts |
| FR-02 | Plan 3.1 FR-02 | Design 2.1 (AIGenerateOptions) | Step1PromptInput.tsx |
| FR-03 | Plan 3.1 FR-03 | Design 3.2-3.3 (SSE) | route.ts, useAIGenerate.ts |
| FR-04 | Plan 3.1 FR-04 | Design 5.3 (Step2) | Step2OutlineEditor.tsx |
| FR-05 | Plan 5.1 Phase 1 | Design 8 (Plugin 전환) | SlidePreview.tsx, separators.ts |
| FR-06 | Plan 5.4 Phase 4 | Design 7 (PPTX) | pptxExporter.ts, ExportButtons.tsx |
| FR-07 | Plan 3.1 FR-07 | Design 4.2 (Generator Prompt) | prompts.ts |
| FR-08 | Plan 3.1 FR-08 | - | (Phase 2+ 구현) |
| FR-09 | Plan 3.1 FR-09 | Design 4.3 (Templates) | promptTemplates.ts |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-09 | Initial draft |
