# change-llm-provider Design Document

> **Summary**: Anthropic Claude SDK를 OpenAI SDK로 교체하는 상세 설계
>
> **Project**: md-to-slides
> **Version**: 0.3.0
> **Author**: ax
> **Date**: 2026-02-09
> **Status**: Draft
> **Planning Doc**: [change-llm-provider.plan.md](../01-plan/features/change-llm-provider.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- `@anthropic-ai/sdk`를 `openai` SDK로 완전 교체
- 기존 2+2 하이브리드 파이프라인 아키텍처 100% 유지
- SSE 이벤트 형식 및 클라이언트 인터페이스 변경 없음
- Planning 단계에서 `response_format: json_object`로 안정성 향상

### 1.2 Design Principles

- **최소 변경 원칙**: 변경은 서버 사이드 SDK 호출 레이어에만 한정
- **인터페이스 보존**: 타입, SSE 이벤트, Hook, UI 변경 없음
- **하위 호환성**: 동일한 환경변수 패턴 유지 (키 이름만 변경)

---

## 2. Architecture

### 2.1 변경 영향 범위

```
┌─────────────────────────────────────────────────────────┐
│                     변경 불필요 (유지)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  UI 컴포넌트   │  │  Zustand     │  │  useAI       │   │
│  │  (Wizard)     │  │  Store       │  │  Generate    │   │
│  └──────────────┘  └──────────────┘  └──────┬───────┘   │
│                                             │ SSE       │
│  ┌──────────────┐  ┌──────────────┐         │           │
│  │  ai.types.ts  │  │  prompts.ts  │         │           │
│  └──────────────┘  └──────────────┘         │           │
├─────────────────────────────────────────────┼───────────┤
│                     변경 대상                 │           │
│  ┌──────────────┐         ┌─────────────────▼────────┐  │
│  │ errorHandler │         │ route.ts (API)            │  │
│  │   .ts        │         │ Anthropic → OpenAI 초기화  │  │
│  └──────────────┘         └─────────────┬────────────┘  │
│                                         │               │
│                           ┌─────────────▼────────────┐  │
│                           │ pipeline.ts              │  │
│                           │ executePlanning()        │  │
│                           │ executeGeneration()      │  │
│                           │ Anthropic → OpenAI 호출   │  │
│                           └──────────────────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ package.json  │  │ .env.example │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow (변경 없음)

```
User Input → [Step1] → /api/ai/generate (plan)
                         → OpenAI Chat Completions (JSON mode)
                         → SSE: planning_complete
             [Step2/3 편집]
             [Step4] → /api/ai/generate (generate)
                         → OpenAI Chat Completions (stream: true)
                         → SSE: md_delta, slide_complete, complete
             → Editor (reveal.js 마크다운)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `pipeline.ts` | `openai` SDK | LLM API 호출 |
| `route.ts` | `pipeline.ts` | API 라우트에서 파이프라인 실행 |
| `errorHandler.ts` | - | OpenAI 에러 분류 |

---

## 3. 파일별 변경 명세

### 3.1 `package.json` - SDK 교체

**변경 내용:**
```diff
- "@anthropic-ai/sdk": "^0.74.0",
+ "openai": "^4.80.0",
```

**실행 명령:**
```bash
npm uninstall @anthropic-ai/sdk
npm install openai
```

---

### 3.2 `.env.example` - 환경변수 변경

**변경 전:**
```env
# AI Configuration
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_AI_ENABLED=true
AI_MODEL=claude-sonnet-4-5-20250929
AI_MAX_TOKENS=4000
```

**변경 후:**
```env
# AI Configuration
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_AI_ENABLED=true
AI_MODEL=gpt-4o
AI_MAX_TOKENS=4000
```

---

### 3.3 `src/lib/ai/pipeline.ts` - 핵심 변경

**변경 전 시그니처:**
```typescript
import Anthropic from '@anthropic-ai/sdk'

export async function executePlanning(
  anthropic: Anthropic,
  options: AIGenerateOptions
): Promise<PlanningResult>

export async function executeGeneration(
  anthropic: Anthropic,
  outline: OutlineItem[],
  theme: string,
  language: 'ko' | 'en',
  controller: ReadableStreamDefaultController,
  encodeSSE: (event: SSEEvent) => string
): Promise<void>
```

**변경 후 시그니처:**
```typescript
import OpenAI from 'openai'

export async function executePlanning(
  openai: OpenAI,
  options: AIGenerateOptions
): Promise<PlanningResult>

export async function executeGeneration(
  openai: OpenAI,
  outline: OutlineItem[],
  theme: string,
  language: 'ko' | 'en',
  controller: ReadableStreamDefaultController,
  encodeSSE: (event: SSEEvent) => string
): Promise<void>
```

#### 3.3.1 `executePlanning()` 변경 상세

**변경 전 (Anthropic):**
```typescript
const message = await anthropic.messages.create({
  model,
  max_tokens: 2000,
  system: [
    {
      type: 'text',
      text: PLANNING_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [
    { role: 'user', content: userPrompt },
  ],
})

const content = message.content[0]
if (content.type !== 'text') {
  throw new Error('Unexpected response type from planning call')
}
const result = JSON.parse(content.text) as PlanningResult
```

**변경 후 (OpenAI):**
```typescript
const response = await openai.chat.completions.create({
  model,
  max_tokens: 2000,
  response_format: { type: 'json_object' },
  messages: [
    { role: 'system', content: PLANNING_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ],
})

const content = response.choices[0]?.message?.content
if (!content) {
  throw new Error('Empty response from planning call')
}
const result = JSON.parse(content) as PlanningResult
```

**핵심 차이점:**
- `system` 파라미터 → `messages` 배열의 `role: 'system'` 메시지
- `cache_control` 제거 (OpenAI는 자동 캐싱)
- `response_format: { type: 'json_object' }` 추가
- 응답 추출: `message.content[0].text` → `response.choices[0].message.content`

#### 3.3.2 `executeGeneration()` 변경 상세

**변경 전 (Anthropic):**
```typescript
const stream = anthropic.messages.stream({
  model,
  max_tokens: maxTokens,
  system: [
    {
      type: 'text',
      text: GENERATOR_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [
    { role: 'user', content: userPrompt },
  ],
})

stream.on('text', (text) => {
  fullMarkdown += text
  controller.enqueue(encodeSSE({ type: 'md_delta', content: text }))

  if (text.includes('\n---\n') || text.includes('\n---')) {
    currentSlideNumber++
    controller.enqueue(
      encodeSSE({ type: 'slide_complete', slideNumber: currentSlideNumber })
    )
  }
})

const message = await stream.finalMessage()
tokensUsed = message.usage.input_tokens + message.usage.output_tokens
```

**변경 후 (OpenAI):**
```typescript
const stream = await openai.chat.completions.create({
  model,
  max_tokens: maxTokens,
  stream: true,
  stream_options: { include_usage: true },
  messages: [
    { role: 'system', content: GENERATOR_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ],
})

for await (const chunk of stream) {
  // 마지막 청크에서 사용량 정보 추출
  if (chunk.usage) {
    tokensUsed = chunk.usage.prompt_tokens + chunk.usage.completion_tokens
    continue
  }

  const text = chunk.choices[0]?.delta?.content
  if (!text) continue

  fullMarkdown += text
  controller.enqueue(encodeSSE({ type: 'md_delta', content: text }))

  if (text.includes('\n---\n') || text.includes('\n---')) {
    currentSlideNumber++
    controller.enqueue(
      encodeSSE({ type: 'slide_complete', slideNumber: currentSlideNumber })
    )
  }
}
```

**핵심 차이점:**
- EventEmitter (`stream.on('text')`) → AsyncIterator (`for await`)
- `stream.finalMessage()` → `chunk.usage` (마지막 청크에 포함)
- `usage.input_tokens + output_tokens` → `usage.prompt_tokens + completion_tokens`
- `stream_options: { include_usage: true }` 필수 (토큰 추적용)

---

### 3.4 `src/app/api/ai/generate/route.ts` - SDK 초기화 변경

**변경 전:**
```typescript
import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  return new Response(
    JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  )
}
const anthropic = new Anthropic({ apiKey })
```

**변경 후:**
```typescript
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  return new Response(
    JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  )
}
const openai = new OpenAI({ apiKey })
```

**함수 호출 변경:**
```diff
- const result = await executePlanning(anthropic, options)
+ const result = await executePlanning(openai, options)

- await executeGeneration(anthropic, outline, theme, language, controller, encodeSSE)
+ await executeGeneration(openai, outline, theme, language, controller, encodeSSE)
```

---

### 3.5 `src/lib/ai/errorHandler.ts` - 에러 분류 보강

**`classifyError()` 함수에 OpenAI 에러 타입 추가:**

```typescript
export function classifyError(error: Error): ErrorRecoveryKey {
  const message = error.message.toLowerCase()

  // OpenAI 에러 타입 체크
  if (
    message.includes('rate') ||
    message.includes('429') ||
    error.constructor.name === 'RateLimitError'
  ) {
    return 'rate_limit'
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('econnrefused') ||
    message.includes('timeout') ||
    error.constructor.name === 'APIConnectionError'
  ) {
    return 'network_error'
  }

  if (
    message.includes('401') ||
    message.includes('authentication') ||
    error.constructor.name === 'AuthenticationError'
  ) {
    return 'planning_fail' // API 키 오류는 planning_fail로 분류
  }

  if (message.includes('planning') || message.includes('outline')) {
    return 'planning_fail'
  }

  if (message.includes('partial')) {
    return 'generation_partial'
  }

  return 'generation_fail'
}
```

---

## 4. 변경하지 않는 파일 (명시적 확인)

| 파일 | 이유 |
|------|------|
| `src/lib/ai/prompts.ts` | 시스템 프롬프트 텍스트는 모델 비의존적 |
| `src/lib/ai/streamHelpers.ts` | SSE 인코딩/파싱은 SDK 무관 |
| `src/types/ai.types.ts` | 타입 정의는 LLM 독립적 |
| `src/hooks/useAIGenerate.ts` | 클라이언트 Hook은 SSE만 처리 |
| `src/store/ai-wizard-store.ts` | Zustand 스토어는 UI 상태만 관리 |
| `src/components/ai-wizard/*` | UI 컴포넌트는 SSE 이벤트만 소비 |

---

## 5. Error Handling

### 5.1 OpenAI 에러 코드 매핑

| HTTP Code | OpenAI Error Class | 분류 | 처리 |
|-----------|-------------------|------|------|
| 401 | `AuthenticationError` | `planning_fail` | API 키 확인 안내 |
| 429 | `RateLimitError` | `rate_limit` | 60초 후 재시도 |
| 500 | `InternalServerError` | `generation_fail` | 재시도 |
| 연결 실패 | `APIConnectionError` | `network_error` | 1/3/5초 간격 재시도 |

---

## 6. Test Plan

### 6.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| 수동 테스트 | Planning JSON 응답 | 브라우저 |
| 수동 테스트 | Generation 스트리밍 | 브라우저 |
| 수동 테스트 | 에러 처리 (잘못된 키) | 브라우저 |

### 6.2 Test Cases

- [ ] Planning: 프롬프트 입력 → JSON 아웃라인 정상 반환
- [ ] Planning: `response_format: json_object`로 유효한 JSON 보장
- [ ] Generation: 아웃라인 기반 → reveal.js 마크다운 스트리밍
- [ ] Generation: `md_delta` 이벤트로 실시간 미리보기
- [ ] Generation: `slide_complete` 이벤트로 진행률 표시
- [ ] Generation: `complete` 이벤트에 `tokensUsed`, `durationMs` 포함
- [ ] Error: 잘못된 API 키 → 에러 메시지 표시
- [ ] Error: 네트워크 오류 → 재시도 안내
- [ ] UI: Wizard 4단계 전체 흐름 정상 동작

---

## 7. Implementation Order

### 7.1 구현 순서

1. [ ] `package.json` - SDK 교체 (`npm uninstall @anthropic-ai/sdk && npm install openai`)
2. [ ] `.env.example` - 환경변수 변경 + `.env.local` 설정
3. [ ] `src/lib/ai/pipeline.ts` - 핵심 API 호출 로직 교체
4. [ ] `src/app/api/ai/generate/route.ts` - SDK 초기화 변경
5. [ ] `src/lib/ai/errorHandler.ts` - OpenAI 에러 분류 추가
6. [ ] 빌드 확인 (`npm run build`)
7. [ ] 수동 테스트 (Planning + Generation)

### 7.2 예상 변경량

| 파일 | 추가 | 삭제 | 순변경 |
|------|------|------|--------|
| `package.json` | 1줄 | 1줄 | 0 |
| `.env.example` | 2줄 | 2줄 | 0 |
| `pipeline.ts` | ~35줄 | ~35줄 | 0 |
| `route.ts` | ~5줄 | ~5줄 | 0 |
| `errorHandler.ts` | ~6줄 | 0줄 | +6 |
| **합계** | **~49줄** | **~43줄** | **+6** |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-09 | Initial draft | ax |
