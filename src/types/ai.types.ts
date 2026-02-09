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
