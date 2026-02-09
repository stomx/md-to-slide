# Gen AI 슬라이드 생성 기능 Design Document

> **Summary**: 자연어 입력 → AI Agent 파이프라인 → reveal.js 마크다운 슬라이드 생성 + PPTX 내보내기
>
> **Project**: md-to-slide
> **Version**: 0.2.0
> **Date**: 2026-02-09
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/apply-gen-ai-feature.plan.md`

---

## 1. Architecture Overview

### 1.1 AI Agent 파이프라인 아키텍처

**설계 원칙**: 논리적 단계 4개, 물리적 API 호출 2개 (2+2 하이브리드)

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 입력                                │
│  "AI 트렌드에 대한 5장짜리 발표자료 만들어줘"                       │
│  + 옵션: { slideCount: 5, theme: 'black', language: 'ko' }      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Call 1: Planning Agent (단일 API 호출)                          │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐    │
│  │ 1. Analyzer  │→│ 2. Strategist   │→│ 3. Outliner      │    │
│  │ 요구사항 분석 │  │ 전략 수립        │  │ 아웃라인 생성     │    │
│  └─────────────┘  └─────────────────┘  └──────────────────┘    │
│                                                                  │
│  Output: PlanningResult (JSON)                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  사용자 개입 지점                                                 │
│  - 아웃라인 확인/수정 (드래그앤드롭, 인라인 편집)                    │
│  - 슬라이드 추가/삭제/순서 변경                                    │
│  - "재생성" 또는 "다음" 선택                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Call 2: Generator Agent (스트리밍 API 호출)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4. Markdown Generator                                    │   │
│  │ - PlanningResult JSON을 입력으로 받음                      │   │
│  │ - reveal.js 마크다운 문법 가이드 + few-shot 예시 포함       │   │
│  │ - SSE 스트리밍으로 실시간 출력                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Output: reveal.js Markdown (Streaming)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  결과 처리                                                       │
│  - 에디터에 마크다운 반영                                         │
│  - reveal.js 실시간 프리뷰 업데이트                               │
│  - 사용자 수동 편집 가능                                          │
│  - PDF/PPTX 내보내기                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 설계 결정 근거

| 결정 | 선택 | 근거 |
|------|------|------|
| API 호출 수 | 2회 (Plan + Generate) | 4-Call 대비 33% 비용 절감, 1-Call 대비 아웃라인 수정 가능 |
| Stage 1-3 병합 | 단일 JSON 출력 | 모두 구조화 데이터이므로 품질 저하 없이 병합 가능 |
| Stage 4 분리 | 별도 스트리밍 호출 | 출력 형식이 마크다운으로 다르며, 시스템 프롬프트를 생성 전용으로 특화 |
| 사용자 개입 | Call 1 ~ Call 2 사이 | UX 연구상 outline-first 접근이 사용자 선호도 최고 |
| 모델 선택 | 둘 다 Sonnet 4.5 | Planning에 Haiku 사용 시 품질 저하 위험, Prompt Caching으로 비용 최적화 |
| reveal.js 문법 전달 | 시스템 프롬프트 내장 + few-shot 예시 | 문법 전체가 ~2,000 토큰으로 작아 RAG/MCP 불필요, Prompt Caching으로 비용 최적화 |

### 1.3 비용 분석

| 시나리오 | 토큰 수 | 비용 (Sonnet 4.5) |
|----------|---------|-------------------|
| 5장 슬라이드 1회 생성 | ~6,200 tok | ~$0.05 |
| 5장 + 아웃라인 수정 후 재생성 | ~8,200 tok | ~$0.07 |
| 10장 슬라이드 1회 생성 | ~10,000 tok | ~$0.08 |
| Prompt Caching 적용 시 | 위 비용의 ~50% | ~$0.025-0.04 |

---

## 2. Data Models

### 2.1 AI 관련 타입 정의

```typescript
// src/types/ai.types.ts

/**
 * AI 생성 옵션
 */
export interface AIGenerateOptions {
  prompt: string
  slideCount: number | 'auto'
  theme: string
  language: 'ko' | 'en'
  templateId?: string
}

/**
 * Call 1 출력: Planning 결과
 */
export interface PlanningResult {
  analysis: {
    intent: string
    audience: string
    depth: 'overview' | 'intermediate' | 'deep'
    suggestedSlideCount: number
  }
  strategy: {
    storyline: string
    flow: 'linear' | 'problem-solution' | 'compare' | 'timeline'
    tone: 'formal' | 'casual' | 'technical'
  }
  outline: OutlineItem[]
}

/**
 * 아웃라인 항목
 */
export interface OutlineItem {
  id: string
  slideNumber: number
  title: string
  keyPoints: string[]
  visualSuggestion: string
  background?: string
  transition?: string
  notes?: string
}

/**
 * SSE 이벤트 타입
 */
export type SSEEvent =
  | { type: 'planning_start' }
  | { type: 'planning_complete'; data: PlanningResult }
  | { type: 'generation_start' }
  | { type: 'md_delta'; content: string }
  | { type: 'slide_complete'; slideNumber: number }
  | { type: 'complete'; markdown: string; metadata: GenerationMetadata }
  | { type: 'error'; stage: 'planning' | 'generation'; message: string; retryable: boolean }

/**
 * 생성 메타데이터
 */
export interface GenerationMetadata {
  totalSlides: number
  tokensUsed: number
  durationMs: number
  model: string
}

/**
 * 프롬프트 템플릿
 */
export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'education' | 'tech' | 'proposal'
  promptPrefix: string
  examplePrompt: string
}
```

### 2.2 기존 타입 확장

```typescript
// src/types/slide.types.ts (수정)

export interface ExportConfig {
  format: 'pdf' | 'html' | 'pptx'  // 'pptx' 추가
  includeNotes: boolean
  theme: string
  customCss?: string
}
```

### 2.3 AI Wizard Store

```typescript
// src/store/ai-wizard-store.ts

import { create } from 'zustand'
import type {
  AIGenerateOptions,
  PlanningResult,
  OutlineItem,
} from '@/types/ai.types'

interface AIWizardStore {
  // Wizard 상태
  isOpen: boolean
  currentStep: 1 | 2 | 3 | 4

  // Step 1: 입력
  prompt: string
  options: Omit<AIGenerateOptions, 'prompt'>

  // Step 2: 아웃라인
  outline: OutlineItem[]

  // Step 3: 상세 계획
  planningResult: PlanningResult | null

  // Step 4: 생성
  isGenerating: boolean
  partialMarkdown: string
  generationProgress: number
  completedSlides: number

  // 에러/로딩
  error: string | null
  isLoading: boolean

  // Actions
  openWizard: () => void
  closeWizard: () => void
  goToStep: (step: 1 | 2 | 3 | 4) => void
  updatePrompt: (prompt: string) => void
  updateOptions: (options: Partial<AIGenerateOptions>) => void
  setPlanningResult: (result: PlanningResult) => void
  setOutline: (outline: OutlineItem[]) => void
  editOutlineItem: (id: string, changes: Partial<OutlineItem>) => void
  reorderOutline: (fromIndex: number, toIndex: number) => void
  deleteOutlineItem: (id: string) => void
  addOutlineItem: (afterId: string) => void
  appendMarkdown: (chunk: string) => void
  setGenerationProgress: (progress: number) => void
  completeGeneration: (fullMarkdown: string) => void
  setError: (error: string | null) => void
  reset: () => void
}
```

---

## 3. API Design

### 3.1 AI 생성 엔드포인트

```
POST /api/ai/generate
Content-Type: application/json
→ Response: text/event-stream (SSE)
```

**Request Body:**

```typescript
interface GenerateRequest {
  action: 'plan' | 'generate'
  // action: 'plan'
  options?: AIGenerateOptions
  // action: 'generate'
  outline?: OutlineItem[]
  theme?: string
  language?: 'ko' | 'en'
}
```

**SSE Response Events:**

```
// action: 'plan'
data: {"type":"planning_start"}
data: {"type":"planning_complete","data":{...PlanningResult}}

// action: 'generate'
data: {"type":"generation_start"}
data: {"type":"md_delta","content":"<!-- .slide: ... -->\n# "}
data: {"type":"md_delta","content":"AI 트렌드"}
data: {"type":"slide_complete","slideNumber":1}
...
data: {"type":"complete","markdown":"...","metadata":{...}}
```

### 3.2 API Route 구현 설계

```typescript
// src/app/api/ai/generate/route.ts

import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  // 1. 환경변수 검증
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return new Response('API key not configured', { status: 500 })

  // 2. 요청 파싱
  const { action, options, outline, theme, language } = await request.json()

  // 3. Anthropic 클라이언트 생성
  const anthropic = new Anthropic({ apiKey })

  // 4. ReadableStream으로 SSE 응답 생성
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (action === 'plan') {
          // Call 1: Planning
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'planning_start' })}\n\n`
          ))
          const result = await executePlanning(anthropic, options)
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'planning_complete', data: result })}\n\n`
          ))
        } else {
          // Call 2: Generation (Streaming)
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'generation_start' })}\n\n`
          ))
          await executeGeneration(anthropic, outline, theme, language, controller, encoder)
        }
      } catch (error) {
        // 에러 이벤트 전송
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: 'error', stage: action, message: error.message, retryable: true })}\n\n`
        ))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
```

### 3.3 Anthropic API 호출 설계

**Call 1 (Planning):**

```typescript
async function executePlanning(
  anthropic: Anthropic,
  options: AIGenerateOptions
): Promise<PlanningResult> {
  const response = await anthropic.messages.create({
    model: process.env.AI_MODEL || 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    system: [
      {
        type: 'text',
        text: PLANNING_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildPlanningUserPrompt(options),
      },
    ],
  })

  // JSON 파싱 + 검증
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text) as PlanningResult
}
```

**Call 2 (Generation - Streaming):**

```typescript
async function executeGeneration(
  anthropic: Anthropic,
  outline: OutlineItem[],
  theme: string,
  language: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<void> {
  let fullMarkdown = ''
  let slideCount = 0
  const startTime = Date.now()

  const stream = anthropic.messages.stream({
    model: process.env.AI_MODEL || 'claude-sonnet-4-5-20250929',
    max_tokens: parseInt(process.env.AI_MAX_TOKENS || '4000'),
    system: [
      {
        type: 'text',
        text: GENERATOR_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildGenerationUserPrompt(outline, theme, language),
      },
    ],
  })

  stream.on('text', (text) => {
    fullMarkdown += text

    // 마크다운 청크 전송
    controller.enqueue(encoder.encode(
      `data: ${JSON.stringify({ type: 'md_delta', content: text })}\n\n`
    ))

    // 슬라이드 구분자 감지 시 완료 이벤트 전송
    const newSlideCount = (fullMarkdown.match(/\n---\n/g) || []).length + 1
    if (newSlideCount > slideCount) {
      slideCount = newSlideCount
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'slide_complete', slideNumber: slideCount })}\n\n`
      ))
    }
  })

  const finalMessage = await stream.finalMessage()

  // 완료 이벤트
  controller.enqueue(encoder.encode(
    `data: ${JSON.stringify({
      type: 'complete',
      markdown: fullMarkdown,
      metadata: {
        totalSlides: slideCount,
        tokensUsed: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
        durationMs: Date.now() - startTime,
        model: finalMessage.model,
      },
    })}\n\n`
  ))
}
```

---

## 4. System Prompt Design

### 4.1 Planning System Prompt

```typescript
// src/lib/ai/prompts.ts

export const PLANNING_SYSTEM_PROMPT = `당신은 프레젠테이션 전문 기획자입니다.
사용자의 요구사항을 분석하고, 슬라이드 구성 전략을 수립하고, 상세한 아웃라인을 생성합니다.

## 출력 규칙
반드시 아래 JSON 형식으로만 출력하세요. 다른 텍스트를 포함하지 마세요.

{
  "analysis": {
    "intent": "발표의 핵심 목적 (1문장)",
    "audience": "예상 청중 (1문장)",
    "depth": "overview | intermediate | deep",
    "suggestedSlideCount": 숫자
  },
  "strategy": {
    "storyline": "전체 내러티브 흐름 요약 (2-3문장)",
    "flow": "linear | problem-solution | compare | timeline",
    "tone": "formal | casual | technical"
  },
  "outline": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "title": "슬라이드 제목",
      "keyPoints": ["핵심 포인트 1", "핵심 포인트 2"],
      "visualSuggestion": "차트 | 아이콘 그리드 | 인용문 | 이미지 | 코드 | 표",
      "background": "#색상코드 (선택)",
      "transition": "slide | fade | zoom | convex (선택)",
      "notes": "발표자 노트 힌트 (선택)"
    }
  ]
}

## 슬라이드 구성 원칙
- 첫 슬라이드: 제목 + 부제목 (강렬한 인상)
- 내용 슬라이드: 핵심 포인트 3-5개, 간결한 텍스트
- 마지막 슬라이드: 요약, Q&A, 또는 행동 촉구
- flow 유형에 따라 스토리라인 구성:
  - linear: 순차적 정보 전달
  - problem-solution: 문제 제기 → 분석 → 해결책
  - compare: 비교/대조 구조
  - timeline: 시간순 전개`
```

### 4.2 Generator System Prompt

```typescript
export const GENERATOR_SYSTEM_PROMPT = `당신은 reveal.js 마크다운 슬라이드 생성 전문가입니다.
주어진 아웃라인을 기반으로 reveal.js 마크다운 형식의 슬라이드를 생성합니다.

## reveal.js 마크다운 문법 규칙

### 슬라이드 구분
- 수평 슬라이드 구분: --- (별도 줄에 작성)
- 수직 슬라이드 구분: -- (별도 줄에 작성)

### 슬라이드 속성
슬라이드 시작 부분에 HTML 주석으로 속성 지정:
<!-- .slide: data-background="#색상" data-transition="효과" -->

### Fragment (순차 표시)
요소 뒤에 HTML 주석으로 지정:
- 항목 1
- 항목 2 <!-- .element: class="fragment" -->
- 항목 3 <!-- .element: class="fragment" -->

### 발표자 노트
Notes: 키워드 이후 텍스트 (슬라이드 하단에 작성)

### 코드 블록
언어 지정과 라인 하이라이팅 지원

## 출력 규칙
1. 반드시 reveal.js 마크다운 형식으로만 출력
2. 각 슬라이드에 적절한 배경색과 전환 효과 적용
3. 핵심 포인트는 Fragment로 순차 표시
4. 각 슬라이드에 발표자 노트 포함
5. 마크다운 외 다른 텍스트(설명, 주석)를 포함하지 마세요

## 예시 출력

<!-- .slide: data-background="#1a1a2e" data-transition="fade" -->
# AI 기술 트렌드 2026

혁신의 물결을 이해하다

Notes:
인사 후 발표 주제를 소개합니다.

---

<!-- .slide: data-transition="slide" -->
## 주요 트렌드

- 멀티모달 AI의 확산 <!-- .element: class="fragment" -->
- 에이전트 기반 자동화 <!-- .element: class="fragment" -->
- 온디바이스 AI 보편화 <!-- .element: class="fragment" -->

Notes:
각 트렌드를 하나씩 설명하며 구체적 사례를 들어주세요.

---

## 결론

> "AI는 도구이며, 그 가치는 사용하는 사람에 의해 결정됩니다."

**감사합니다**

Notes:
Q&A 시간을 안내합니다.`
```

### 4.3 프롬프트 템플릿 (Skill)

```typescript
// src/constants/promptTemplates.ts

import type { PromptTemplate } from '@/types/ai.types'

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'business',
    name: '비즈니스 발표',
    description: 'IR, 사업 계획, 분기 실적 등',
    category: 'business',
    promptPrefix: '비즈니스 청중을 대상으로, 데이터와 차트 중심의 전문적인 톤으로 작성하세요.',
    examplePrompt: '2026년 1분기 실적 보고 발표자료를 만들어주세요',
  },
  {
    id: 'education',
    name: '교육/강의',
    description: '수업 자료, 세미나, 워크숍 등',
    category: 'education',
    promptPrefix: '학습자의 이해를 돕기 위해 단계적으로 설명하고, 예시와 질문을 포함하세요.',
    examplePrompt: 'Python 기초 프로그래밍 3시간 강의자료를 만들어주세요',
  },
  {
    id: 'tech',
    name: '기술 발표',
    description: '기술 소개, 아키텍처 설명, 데모 등',
    category: 'tech',
    promptPrefix: '기술 청중을 대상으로, 코드 예시와 아키텍처 다이어그램을 포함하세요.',
    examplePrompt: 'Next.js App Router 마이그레이션 가이드 발표자료를 만들어주세요',
  },
  {
    id: 'proposal',
    name: '제안서',
    description: '프로젝트 제안, 투자 제안 등',
    category: 'proposal',
    promptPrefix: '문제 → 해결책 → 기대효과 구조로 설득력 있게 작성하세요.',
    examplePrompt: '사내 AI 도입 제안서 발표자료를 만들어주세요',
  },
]
```

---

## 5. Component Design

### 5.1 UI 레이아웃 통합

```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | ThemeSelector | ExportButtons | [AI 생성] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │
│  │ Markdown   │  │ Slide      │  │ AI Wizard      │    │
│  │ Editor     │  │ Preview    │  │ (conditional)  │    │
│  │   40%      │  │   35%      │  │    25%         │    │
│  └────────────┘  └────────────┘  └────────────────┘    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Footer: Slides: N | Theme: name | Status                │
└─────────────────────────────────────────────────────────┘

- AI 비활성: Editor 50% | Preview 50%
- AI 활성:   Editor 40% | Preview 35% | AI Wizard 25%
- 태블릿:    Tabs에 "AI" 탭 추가
- 모바일:    전체 화면 Dialog
```

### 5.2 컴포넌트 계층 구조

```
App (page.tsx)
└─ ResponsiveLayout (수정)
    ├─ MarkdownEditor
    ├─ SlidePreview
    └─ AIWizardPanel (NEW - conditional)
        ├─ StepIndicator
        ├─ Step1PromptInput
        │   ├─ PromptTextarea
        │   ├─ TemplateSelector
        │   └─ OptionGroup (슬라이드 수, 테마, 언어)
        ├─ Step2OutlineEditor
        │   └─ OutlineItem[] (편집/드래그/삭제)
        ├─ Step3DetailedPlan
        │   └─ Accordion > SlideDetailView[]
        └─ Step4Generation
            ├─ ProgressBar
            ├─ SlideStatusList
            ├─ StreamingPreview
            └─ CompletionSummary (완료 시)
```

### 5.3 주요 컴포넌트 인터페이스

**AIWizardPanel:**
- currentStep에 따라 Step 1~4 컴포넌트 렌더링
- slide-in 애니메이션으로 진입/퇴장 (300ms ease)

**Step1PromptInput:**
- 자연어 프롬프트 입력 (Textarea, maxLength: 1000)
- 템플릿 선택 (비즈니스/교육/기술/제안서)
- 슬라이드 수 (5/8/12/자동), 테마, 언어 옵션

**Step2OutlineEditor:**
- 아웃라인 항목 인라인 편집, 드래그앤드롭 순서 변경
- 항목 추가/삭제, "재생성" 버튼 (Call 1 재실행)

**Step3DetailedPlan:**
- Accordion으로 슬라이드별 상세 내용 확인
- 읽기 전용, 선택적 단계 (건너뛰기 가능)

**Step4Generation:**
- ProgressBar (completedSlides / totalSlides)
- 슬라이드별 상태 목록 (완료/진행중/대기)
- 스트리밍 마크다운 미리보기 (커서 블링크)
- 완료 시: 결과 요약 + 완료/재생성 버튼

### 5.4 스트리밍 중 동기화

```typescript
// AI 스트리밍 → 에디터 + 프리뷰 동기화 흐름

SSE md_delta 이벤트 수신
    │
    ├─→ ai-wizard-store: partialMarkdown 누적
    │
    ├─→ 완성된 슬라이드만 파싱 (--- 구분자 기준)
    │
    └─→ slide-store: markdown 업데이트
            │
            └─→ SlidePreview: reveal.js 자동 sync()
```

- 생성 중 에디터는 읽기 전용 모드
- 완성된 슬라이드만 프리뷰에 표시 (부분 슬라이드는 표시 안 함)
- 새 슬라이드 완성 시 해당 슬라이드로 자동 포커스

---

## 6. Hook Design

### 6.1 useAIGenerate

```typescript
// src/hooks/useAIGenerate.ts

interface UseAIGenerateReturn {
  // Planning
  generatePlan: (options: AIGenerateOptions) => Promise<void>
  planningResult: PlanningResult | null

  // Generation
  generateSlides: (outline: OutlineItem[], theme: string, language: string) => Promise<void>

  // State
  isPlanning: boolean
  isGenerating: boolean
  progress: number
  partialMarkdown: string
  error: string | null

  // Actions
  abort: () => void
  retry: () => void
}
```

**내부 동작:**
1. `fetch('/api/ai/generate', { method: 'POST', body, signal })` 호출
2. `response.body.getReader()`로 SSE 스트림 소비
3. 각 SSE 이벤트를 파싱하여 ai-wizard-store 상태 업데이트
4. `md_delta` 이벤트 시 slide-store의 markdown도 동시 업데이트
5. abort 시 `AbortController.abort()` 호출

---

## 7. PPTX Export Design

### 7.1 변환 매핑 테이블

| reveal.js 요소 | pptxgenjs 매핑 | 비고 |
|----------------|---------------|------|
| `<section>` | `pptx.addSlide()` | 수평 슬라이드 = 1 PPTX 슬라이드 |
| `<h1>` | `slide.addText({ fontSize: 36, bold: true })` | 제목 |
| `<h2>` | `slide.addText({ fontSize: 28, bold: true })` | 부제목 |
| `<h3>~<h6>` | `slide.addText({ fontSize: 20-24, bold: true })` | 소제목 |
| `<ul>/<ol>` | `slide.addText({ bullet: true })` | 목록 |
| `<p>` | `slide.addText()` | 일반 텍스트 |
| `<pre><code>` | `slide.addText({ fontFace: 'Courier New' })` | 코드 블록 |
| `data-background` | `slide.background = { color }` | 배경색 |
| `<aside class="notes">` | `slide.addNotes()` | 발표자 노트 |
| `<blockquote>` | `slide.addText({ italic: true })` | 인용문 |
| Fragment | 순서대로 표시 | 평탄화 |
| 수직 슬라이드 | 수평으로 평탄화 | PPTX에 수직 개념 없음 |

### 7.2 PPTX Exporter 인터페이스

```typescript
// src/lib/export/pptxExporter.ts

interface PptxExportOptions {
  theme: string
  includeNotes: boolean
  fontFamily?: string
}

/**
 * reveal.js 렌더링된 DOM을 PPTX로 변환하여 다운로드
 *
 * 1. reveal.js DOM에서 슬라이드 데이터 추출
 * 2. pptxgenjs로 PPTX 생성
 * 3. Blob 다운로드
 */
export async function exportToPptx(
  revealContainer: HTMLElement,
  options: PptxExportOptions
): Promise<void>
```

---

## 8. reveal.js Markdown Plugin 전환

### 8.1 현재 vs 전환 후

| 항목 | 현재 | 전환 후 |
|------|------|---------|
| 파싱 | `marked` + `DOMPurify` | reveal.js Markdown 플러그인 |
| 렌더링 | slidesToRevealHTML() → DOM 주입 | `<section data-markdown>` |
| 수직 구분자 | `-----` (5개) | `--` (2개) |
| 슬라이드 속성 | 미지원 | `<!-- .slide: -->` 자동 처리 |
| Fragment | 미지원 | `<!-- .element: -->` 자동 처리 |
| 노트 | 수동 파싱 | `Notes:` 자동 처리 |

### 8.2 SlidePreview 변경 설계

- Markdown 플러그인 동적 import 추가
- `plugins: [RevealMarkdown]` 설정
- 슬라이드 업데이트: `<section data-markdown>` + `<script type="text/template">` 방식으로 전환
- `sync()` 호출로 렌더링 갱신
- (Note: DOM 조작 시 DOMPurify 등 기존 보안 패턴 유지)

### 8.3 markdownParser.ts 경량화

```typescript
// 기존: parseMarkdownToSlides() + slidesToRevealHTML()
// 변경: countSlides() + extractSlideMetadata()

export function countSlides(markdown: string): number {
  return markdown.split(/^\n---\n$/m).length
}

export function extractSlideMetadata(markdown: string): SlideMetadata[] {
  // 각 슬라이드의 제목, 노트 유무, 배경색 등 추출
  // Footer 슬라이드 수 표시, 아웃라인 뷰 등에 사용
}
```

### 8.4 구분자 변경

```typescript
// src/constants/separators.ts (수정)

export const HORIZONTAL_SEPARATOR = /^\n---\n$/m     // 유지
export const VERTICAL_SEPARATOR = /^\n--\n$/m        // 변경: ----- → --

export const SEPARATOR_STRINGS = {
  horizontal: '\n---\n',
  vertical: '\n--\n',       // 변경
} as const
```

---

## 9. Error Handling

### 9.1 에러 복구 전략

```typescript
// src/lib/ai/errorHandler.ts

const ERROR_RECOVERY = {
  planning_fail: {
    maxRetries: 2,
    strategy: 'retry_same',
    fallback: 'show_error',
    userMessage: '아웃라인 생성에 실패했습니다. 다시 시도해주세요.',
  },
  generation_fail: {
    maxRetries: 2,
    strategy: 'retry_with_outline',  // outline 유지하고 재시도
    fallback: 'partial_result',      // 생성된 부분까지 표시
    userMessage: '슬라이드 생성 중 오류가 발생했습니다.',
  },
  generation_partial: {
    strategy: 'keep_partial',
    userMessage: '일부 슬라이드만 생성되었습니다. 나머지는 직접 작성해주세요.',
  },
  rate_limit: {
    strategy: 'wait_and_retry',
    retryAfterMs: 60000,
    userMessage: 'API 요청 한도에 도달했습니다. 1분 후 다시 시도해주세요.',
  },
  network_error: {
    maxRetries: 3,
    retryDelayMs: [1000, 3000, 5000],  // exponential backoff
    userMessage: '네트워크 연결을 확인해주세요.',
  },
} as const
```

### 9.2 에러 처리 흐름

```
SSE 스트림 에러 발생
    │
    ├─ retryable: true → 자동 재시도 (최대 2-3회)
    │   ├─ 성공 → 계속 스트리밍
    │   └─ 실패 → 에러 UI 표시
    │
    └─ retryable: false
        ├─ 부분 결과 있음 → 부분 결과 표시 + 안내 메시지
        └─ 부분 결과 없음 → 에러 UI + "다시 시도" 버튼
```

---

## 10. File Structure

### 10.1 신규 및 수정 파일

```
src/
├── app/
│   ├── api/ai/generate/
│   │   └── route.ts                      # NEW: SSE 스트리밍 엔드포인트
│   ├── page.tsx                           # MODIFY: AI 버튼 + Wizard 패널 통합
│   └── layout.tsx
│
├── components/
│   ├── ai-wizard/                         # NEW: AI Wizard 컴포넌트 디렉토리
│   │   ├── AIWizardPanel.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── Step1PromptInput.tsx
│   │   ├── Step2OutlineEditor.tsx
│   │   ├── Step3DetailedPlan.tsx
│   │   ├── Step4Generation.tsx
│   │   └── OutlineItem.tsx
│   ├── SlidePreview.tsx                   # MODIFY: Markdown 플러그인 전환
│   ├── ExportButtons.tsx                  # MODIFY: PPTX 버튼 추가
│   └── ResponsiveLayout.tsx               # MODIFY: AI 패널 슬롯 추가
│
├── lib/
│   ├── ai/                                # NEW: AI 모듈
│   │   ├── pipeline.ts                   # 2-Call 오케스트레이터
│   │   ├── prompts.ts                    # 시스템 프롬프트
│   │   ├── streamHelpers.ts              # SSE 유틸
│   │   └── errorHandler.ts              # 에러 복구
│   ├── export/                            # NEW
│   │   └── pptxExporter.ts              # PPTX 변환
│   ├── markdownParser.ts                  # MODIFY: 경량화
│   └── exportHelper.ts                    # (기존 유지)
│
├── hooks/
│   └── useAIGenerate.ts                   # NEW
│
├── store/
│   ├── slide-store.ts                     # (변경 없음)
│   └── ai-wizard-store.ts                # NEW
│
├── constants/
│   ├── promptTemplates.ts                 # NEW
│   ├── separators.ts                      # MODIFY: 수직 구분자 변경
│   └── defaults.ts                        # MODIFY: DEFAULT_MARKDOWN 수직 구분자 업데이트
│
└── types/
    ├── slide.types.ts                     # MODIFY: ExportConfig 'pptx' 추가
    └── ai.types.ts                        # NEW
```

### 10.2 새 의존성

| 패키지 | 용도 | 크기 |
|--------|------|------|
| `@anthropic-ai/sdk` | Anthropic API 클라이언트 | ~200KB |
| `pptxgenjs` | PPTX 생성 | ~500KB |

---

## 11. Implementation Order

### Phase 1: 기반 전환 (reveal.js Markdown 플러그인)

| # | 파일 | 작업 |
|:-:|------|------|
| 1 | `separators.ts` | 수직 구분자 `-----` → `--` |
| 2 | `SlidePreview.tsx` | Markdown 플러그인 로드 + 렌더링 전환 |
| 3 | `markdownParser.ts` | `countSlides()`, `extractSlideMetadata()` 경량화 |
| 4 | `defaults.ts` | DEFAULT_MARKDOWN 수직 구분자 업데이트 |

### Phase 2: AI 생성 백엔드

| # | 파일 | 작업 |
|:-:|------|------|
| 5 | `ai.types.ts` | AI 타입 정의 |
| 6 | `prompts.ts` | Planning + Generator 시스템 프롬프트 |
| 7 | `pipeline.ts` | Anthropic SDK 래핑 + 2-Call 오케스트레이션 |
| 8 | `streamHelpers.ts` | SSE 인코딩/디코딩 |
| 9 | `errorHandler.ts` | 에러 복구 |
| 10 | `route.ts` | POST 엔드포인트 (SSE) |

### Phase 3: AI 생성 UI

| # | 파일 | 작업 |
|:-:|------|------|
| 11 | `ai-wizard-store.ts` | Wizard 상태 관리 |
| 12 | `useAIGenerate.ts` | SSE 소비 + 상태 연동 |
| 13 | `promptTemplates.ts` | 프롬프트 템플릿 |
| 14-19 | `ai-wizard/*.tsx` | Step 1~4 + Panel + StepIndicator |
| 20 | `ResponsiveLayout.tsx` | AI 패널 슬롯 추가 |
| 21 | `page.tsx` | AI 버튼 + Wizard 통합 |

### Phase 4: PPTX 내보내기

| # | 파일 | 작업 |
|:-:|------|------|
| 22 | `slide.types.ts` | ExportConfig에 'pptx' 추가 |
| 23 | `pptxExporter.ts` | DOM → PPTX 변환 |
| 24 | `ExportButtons.tsx` | PPTX 버튼 추가 |

---

## 12. Environment Variables

```bash
# .env.example (추가)

# AI Configuration
ANTHROPIC_API_KEY=sk-ant-...          # Server-side only
NEXT_PUBLIC_AI_ENABLED=true           # 클라이언트 AI 기능 표시 여부
AI_MODEL=claude-sonnet-4-5-20250929   # 사용할 모델
AI_MAX_TOKENS=4000                    # 최대 생성 토큰
```

**보안:** `ANTHROPIC_API_KEY`는 `NEXT_PUBLIC_` 접두사 없이 서버사이드에서만 접근

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-09 | Initial draft - 전문가 팀 분석 반영 | Claude Code |
