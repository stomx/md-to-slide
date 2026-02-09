# Gen AI 슬라이드 생성 기능 Planning Document

> **Summary**: 자연어 입력으로 reveal.js 마크다운 슬라이드를 자동 생성하고 PDF/PPTX로 내보내는 기능
>
> **Project**: md-to-slide
> **Version**: 0.2.0
> **Author**: Claude Code
> **Date**: 2026-02-09
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

사용자가 자연어(예: "AI 트렌드에 대한 5장짜리 발표자료 만들어줘")로 요청하면, LLM이 reveal.js 마크다운 문법에 맞는 슬라이드 원본을 생성하고, 이를 reveal.js로 렌더링한 뒤 PDF/PPTX로 다운로드할 수 있게 하는 기능.

### 1.2 Background

- 현재 앱은 사용자가 직접 마크다운을 작성해야 함
- reveal.js 고급 문법(배경, 트랜지션, Fragment, 스피커 노트)을 모르면 활용이 어려움
- Gen AI를 활용하면 자연어만으로 전문적인 슬라이드를 빠르게 생성 가능
- PPTX 내보내기는 기존에 지원하지 않던 기능으로, 비즈니스 활용도를 크게 높임

### 1.3 Related Documents

- Schema: `docs/01-plan/schema.md`
- Conventions: `docs/01-plan/conventions.md`
- reveal.js 공식 문서: https://revealjs.com/markdown/

---

## 2. Scope

### 2.1 In Scope

- [ ] AI 슬라이드 생성 UI (프롬프트 입력 + 옵션 선택)
- [ ] LLM API 연동 (Next.js API Route → AI Provider)
- [ ] reveal.js 마크다운 문법 기반 슬라이드 생성
- [ ] 스트리밍 응답으로 실시간 생성 미리보기
- [ ] reveal.js Markdown 플러그인 전환 (현재 파서 → 네이티브 플러그인)
- [ ] PPTX 내보내기 (pptxgenjs 활용)
- [ ] PDF 내보내기 개선 (기존 print-pdf 유지)
- [ ] 생성된 마크다운 편집 가능 (에디터 연동)

### 2.2 Out of Scope

- 이미지 생성 (DALL-E 등 연동)
- 실시간 협업 편집
- 슬라이드 템플릿 마켓플레이스
- 사용자 인증/로그인 시스템
- 슬라이드 저장/불러오기 (DB 연동)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 자연어 프롬프트로 슬라이드 마크다운 생성 | High | Pending |
| FR-02 | 슬라이드 수, 테마, 언어 등 생성 옵션 설정 | High | Pending |
| FR-03 | 스트리밍 응답으로 실시간 생성 진행 표시 | High | Pending |
| FR-04 | 생성된 마크다운을 에디터에 반영하여 수정 가능 | High | Pending |
| FR-05 | reveal.js Markdown 플러그인으로 렌더링 전환 | High | Pending |
| FR-06 | PPTX 내보내기 (pptxgenjs) | High | Pending |
| FR-07 | reveal.js 고급 문법 활용 (배경, 트랜지션, Fragment, 노트) | Medium | Pending |
| FR-08 | 생성 이력 관리 (localStorage) | Low | Pending |
| FR-09 | AI 프롬프트 템플릿 (비즈니스, 교육, 기술 발표 등) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 스트리밍 첫 토큰 < 1초 (TTFT) | API 응답 시간 측정 |
| Performance | 10장 슬라이드 전체 생성 < 15초 | E2E 시간 측정 |
| Security | API Key 서버사이드 관리 (클라이언트 노출 금지) | 코드 리뷰 |
| UX | 생성 중 실시간 프리뷰 업데이트 | 수동 테스트 |
| Compatibility | PPTX 파일 MS PowerPoint/Google Slides 호환 | 수동 테스트 |
| Cost | 슬라이드 1회 생성 비용 < $0.05 (Sonnet 기준) | API 비용 측정 |

---

## 4. Technical Architecture

### 4.1 AI 슬라이드 생성 흐름

```
┌─────────────────┐
│  사용자 입력      │  "AI 트렌드에 대한 5장짜리 발표자료"
│  (자연어 프롬프트) │  + 옵션: 테마, 슬라이드 수, 언어
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Next.js         │  POST /api/generate-slides
│  API Route       │  - 시스템 프롬프트 (reveal.js 문법 가이드)
│  (Server-side)   │  - 사용자 프롬프트 조합
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  LLM API         │  Anthropic Claude API (Sonnet 4.5)
│  (Streaming)     │  - reveal.js 마크다운 형식 출력
│                  │  - 스피커 노트, 배경, 트랜지션 포함
└────────┬────────┘
         │ SSE (Server-Sent Events)
         ↓
┌─────────────────┐
│  클라이언트       │  1. 스트리밍 마크다운 수신
│  (React)         │  2. 에디터에 실시간 반영
│                  │  3. reveal.js 실시간 프리뷰 업데이트
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  reveal.js       │  Markdown 플러그인으로 렌더링
│  렌더링          │  - 배경, 트랜지션, Fragment 자동 적용
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  내보내기        │  - PDF: reveal.js print-pdf
│  (Export)        │  - PPTX: pptxgenjs 변환
└─────────────────┘
```

### 4.2 AI Provider 선택

| Provider | Model | 장점 | 단점 | 비용 (1K tokens) |
|----------|-------|------|------|-----------------|
| **Anthropic** | Claude Sonnet 4.5 | 마크다운 생성 품질 우수, 스트리밍 지원 | - | ~$3/1M input, $15/1M output |
| OpenAI | GPT-4o | 빠른 응답, JSON 모드 | 마크다운 코드 블록 생성 시 품질 저하 | ~$2.5/1M input, $10/1M output |
| Google | Gemini 2.0 | 비용 효율적 | 마크다운 포맷 일관성 부족 | ~$1.25/1M input |

**권장: Anthropic Claude Sonnet 4.5**
- 마크다운 생성 품질이 가장 우수 (연구 결과 기반)
- 스트리밍 API 안정적
- 프롬프트 추종력이 높아 reveal.js 문법 준수율이 높음

### 4.3 출력 포맷 전략

**마크다운 직접 출력 (권장)** vs JSON 구조화 출력:

| 방식 | 장점 | 단점 |
|------|------|------|
| **마크다운 직접 출력** | 자연스러운 스트리밍, reveal.js 즉시 렌더링 가능, LLM 생성 품질 높음 | 파싱 오류 가능성 |
| JSON 구조화 출력 | 타입 안정성, 슬라이드별 메타데이터 분리 | 스트리밍 복잡, LLM 코드 생성 시 품질 저하 |

**결론**: 마크다운 직접 출력 방식 채택. reveal.js Markdown 플러그인이 자동 파싱하므로 별도 변환 불필요.

### 4.4 시스템 프롬프트 설계

```
당신은 프레젠테이션 전문가입니다. reveal.js 마크다운 형식으로 슬라이드를 생성합니다.

## 출력 규칙
1. 슬라이드 구분: `---` (수평), `--` (수직)
2. 슬라이드 속성: `<!-- .slide: data-background="#색상" data-transition="효과" -->`
3. Fragment: `<!-- .element: class="fragment" -->`
4. 스피커 노트: `Notes:` 이후 텍스트
5. 코드 블록: ```언어 [하이라이트 범위]

## 슬라이드 구성 원칙
- 첫 슬라이드: 제목 + 부제목 (강렬한 배경색)
- 내용 슬라이드: 핵심 포인트 3-5개, 간결한 텍스트
- 마지막 슬라이드: 요약 또는 Q&A
- 각 슬라이드에 적절한 트랜지션 효과 적용
```

### 4.5 PPTX 내보내기 아키텍처

**라이브러리**: `pptxgenjs` (클라이언트 사이드)
- 13K+ GitHub Stars, 활발한 유지보수
- 브라우저/Node.js 모두 지원
- 슬라이드 마스터, 배경, 노트, 코드 블록 지원

**변환 매핑**:

| reveal.js 요소 | PPTX 매핑 |
|----------------|-----------|
| `<section>` | `pptx.addSlide()` |
| `<h1>`~`<h6>` | `slide.addText()` (fontSize 조절) |
| `<ul>/<ol>` | `slide.addText()` (bullet: true) |
| `data-background` | `slide.background = { color }` |
| `<code>` | `slide.addText()` (monospace font) |
| `Notes:` | `slide.addNotes()` |
| Fragment | 순차 슬라이드로 분리 또는 무시 |
| 수직 슬라이드 | 수평 슬라이드로 평탄화 |

---

## 5. Implementation Plan

### 5.1 Phase 1: 기반 전환 (reveal.js Markdown 플러그인)

**목표**: 현재 `marked` 기반 파서를 reveal.js 네이티브 Markdown 플러그인으로 전환

| 작업 | 파일 | 설명 |
|------|------|------|
| Markdown 플러그인 로드 | `SlidePreview.tsx` | reveal.js Markdown 플러그인 import |
| 렌더링 방식 전환 | `SlidePreview.tsx` | `<section data-markdown>` 방식으로 변경 |
| 구분자 표준화 | `separators.ts` | `-----` → `--` (수직 슬라이드) |
| 파서 경량화 | `markdownParser.ts` | 슬라이드 수 카운팅 + 메타데이터 추출용으로 변경 |
| 타입 확장 | `slide.types.ts` | AI 관련 타입 추가 |

### 5.2 Phase 2: AI 생성 백엔드

**목표**: LLM API 연동 및 스트리밍 엔드포인트 구축

| 작업 | 파일 | 설명 |
|------|------|------|
| API Route 생성 | `src/app/api/generate-slides/route.ts` | POST 엔드포인트 (SSE 스트리밍) |
| 시스템 프롬프트 | `src/lib/ai/systemPrompt.ts` | reveal.js 마크다운 생성 가이드 |
| AI 클라이언트 | `src/lib/ai/aiClient.ts` | Anthropic SDK 래퍼 |
| 환경 변수 | `.env.example` | `ANTHROPIC_API_KEY` 추가 |
| 에러 핸들링 | `src/lib/ai/errorHandler.ts` | Rate limit, timeout 처리 |

### 5.3 Phase 3: AI 생성 UI

**목표**: 사용자 프롬프트 입력 및 생성 옵션 UI

| 작업 | 파일 | 설명 |
|------|------|------|
| AI 생성 패널 | `src/components/AiGeneratePanel.tsx` | 프롬프트 입력 + 옵션 UI |
| 프롬프트 템플릿 | `src/constants/promptTemplates.ts` | 비즈니스/교육/기술 템플릿 |
| 스트리밍 훅 | `src/hooks/useAiGenerate.ts` | SSE 연결 + 상태 관리 |
| 스토어 확장 | `src/store/slide-store.ts` | AI 생성 상태 추가 |
| 메인 페이지 | `src/app/page.tsx` | AI 패널 통합 |

### 5.4 Phase 4: PPTX 내보내기

**목표**: reveal.js 슬라이드를 PPTX로 변환/다운로드

| 작업 | 파일 | 설명 |
|------|------|------|
| pptxgenjs 설치 | `package.json` | `npm install pptxgenjs` |
| PPTX 변환기 | `src/lib/export/pptxExporter.ts` | HTML → PPTX 변환 로직 |
| Export 타입 확장 | `slide.types.ts` | `ExportConfig.format` 에 `'pptx'` 추가 |
| Export UI 확장 | `ExportButtons.tsx` | PPTX 다운로드 버튼 추가 |

---

## 6. Success Criteria

### 6.1 Definition of Done

- [ ] 자연어 프롬프트로 reveal.js 슬라이드 생성 가능
- [ ] 생성된 슬라이드가 reveal.js에서 정상 렌더링
- [ ] 스트리밍 응답으로 실시간 생성 진행 확인 가능
- [ ] 생성된 마크다운을 에디터에서 수정 가능
- [ ] PPTX 내보내기 후 MS PowerPoint에서 정상 열림
- [ ] PDF 내보내기 정상 동작
- [ ] 코드 리뷰 완료
- [ ] 테스트 작성 및 통과

### 6.2 Quality Criteria

- [ ] TypeScript 에러 0건
- [ ] ESLint 에러 0건
- [ ] 빌드 성공
- [ ] API Key가 클라이언트에 노출되지 않음

---

## 7. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| LLM 출력이 reveal.js 문법에 맞지 않음 | High | Medium | 시스템 프롬프트 최적화 + 후처리 유효성 검사 |
| API 비용 초과 | Medium | Medium | 사용자별 생성 횟수 제한 (localStorage) |
| 스트리밍 중 연결 끊김 | Medium | Low | 재시도 로직 + 부분 결과 보존 |
| PPTX 변환 시 레이아웃 깨짐 | High | Medium | 슬라이드별 단순 레이아웃 사용 + 테스트 강화 |
| reveal.js Markdown 플러그인 전환 시 기존 기능 회귀 | High | Low | 기존 테스트 유지 + 수동 QA |

---

## 8. Architecture Considerations

### 8.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

> Starter → Dynamic 레벨 전환: API Route 추가로 서버사이드 로직 필요

### 8.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| AI Provider | Anthropic / OpenAI / Google | Anthropic Claude Sonnet 4.5 | 마크다운 생성 품질, 스트리밍 안정성 |
| 출력 포맷 | Markdown / JSON | Markdown 직접 출력 | 스트리밍 자연스러움, reveal.js 즉시 렌더링 |
| 스트리밍 방식 | SSE / WebSocket / Polling | SSE (Server-Sent Events) | Next.js API Route 호환, 단방향 충분 |
| PPTX 라이브러리 | pptxgenjs / officegen / docx | pptxgenjs | 13K stars, 브라우저 지원, 풍부한 API |
| Markdown 파싱 | marked (현재) / reveal.js 플러그인 | reveal.js Markdown 플러그인 | 고급 문법 자동 지원 |
| API Key 관리 | Server-side only | Server-side (API Route) | 보안 필수 |

### 8.3 폴더 구조 변경

```
src/
├── app/
│   ├── api/
│   │   └── generate-slides/
│   │       └── route.ts          # NEW: AI 생성 API 엔드포인트
│   ├── page.tsx                   # MODIFY: AI 패널 통합
│   └── layout.tsx
├── components/
│   ├── AiGeneratePanel.tsx        # NEW: AI 생성 UI
│   ├── SlidePreview.tsx           # MODIFY: Markdown 플러그인 전환
│   ├── ExportButtons.tsx          # MODIFY: PPTX 버튼 추가
│   └── ...
├── lib/
│   ├── ai/                        # NEW: AI 관련 모듈
│   │   ├── aiClient.ts            # LLM API 클라이언트
│   │   ├── systemPrompt.ts        # 시스템 프롬프트
│   │   └── streamParser.ts        # 스트리밍 응답 파서
│   ├── export/                    # NEW: 내보내기 모듈 분리
│   │   ├── pptxExporter.ts        # PPTX 변환
│   │   └── pdfExporter.ts         # PDF 변환 (기존 이전)
│   ├── markdownParser.ts          # MODIFY: 경량화
│   └── exportHelper.ts            # MODIFY: 모듈 분리 후 래퍼
├── hooks/
│   └── useAiGenerate.ts           # NEW: AI 생성 커스텀 훅
├── constants/
│   ├── promptTemplates.ts         # NEW: 프롬프트 템플릿
│   └── ...
├── store/
│   └── slide-store.ts             # MODIFY: AI 상태 추가
└── types/
    └── slide.types.ts             # MODIFY: AI/PPTX 타입 추가
```

---

## 9. Convention Prerequisites

### 9.1 Existing Project Conventions

- [x] `docs/01-plan/conventions.md` exists
- [x] ESLint configuration (`.eslintrc.json`)
- [x] Prettier configuration (`.prettierrc`)
- [x] TypeScript configuration (`tsconfig.json`)

### 9.2 New Environment Variables

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `ANTHROPIC_API_KEY` | Anthropic API 인증 | Server | ☑ |
| `NEXT_PUBLIC_AI_ENABLED` | AI 기능 활성화 플래그 | Client | ☑ |
| `AI_MAX_TOKENS` | 최대 생성 토큰 수 | Server | ☑ |
| `AI_MODEL` | 사용할 AI 모델 | Server | ☑ |

---

## 10. Dependencies

### 10.1 New Dependencies

| Package | Purpose | Size | License |
|---------|---------|------|---------|
| `@anthropic-ai/sdk` | Anthropic API SDK | ~200KB | MIT |
| `pptxgenjs` | PPTX 생성 | ~500KB | MIT |

### 10.2 reveal.js 플러그인 (이미 포함)

| Plugin | Purpose | Status |
|--------|---------|--------|
| `RevealMarkdown` | 마크다운 파싱/렌더링 | public/reveal.js에 포함 확인 필요 |
| `RevealHighlight` | 코드 하이라이팅 | 선택 사항 |
| `RevealNotes` | 스피커 노트 | 선택 사항 |

---

## 11. Next Steps

1. [ ] Design 문서 작성 (`apply-gen-ai-feature.design.md`)
2. [ ] 팀 리뷰 및 승인
3. [ ] Phase 1부터 순차 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-09 | Initial draft | Claude Code |
