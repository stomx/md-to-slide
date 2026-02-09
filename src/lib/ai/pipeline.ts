import Anthropic from '@anthropic-ai/sdk'
import { PLANNING_SYSTEM_PROMPT, GENERATOR_SYSTEM_PROMPT } from './prompts'
import type {
  AIGenerateOptions,
  PlanningResult,
  OutlineItem,
  SSEEvent,
} from '@/types/ai.types'

/**
 * Planning 호출을 위한 사용자 프롬프트 생성
 */
export function buildPlanningUserPrompt(options: AIGenerateOptions): string {
  const { prompt, slideCount, theme, language } = options

  let countInstruction = ''
  if (slideCount === 'auto') {
    countInstruction = '적절한 슬라이드 수를 자동으로 결정해주세요.'
  } else {
    countInstruction = `총 ${slideCount}개의 슬라이드로 구성해주세요.`
  }

  const languageInstruction =
    language === 'ko' ? '한국어로 작성해주세요.' : 'Write in English.'

  return `
요구사항: ${prompt}

슬라이드 수: ${countInstruction}
테마: ${theme}
언어: ${languageInstruction}

위 요구사항을 분석하고 JSON 형식의 아웃라인을 생성해주세요.
  `.trim()
}

/**
 * Generation 호출을 위한 사용자 프롬프트 생성
 */
export function buildGenerationUserPrompt(
  outline: OutlineItem[],
  theme: string,
  language: 'ko' | 'en'
): string {
  const languageInstruction =
    language === 'ko' ? '한국어로 작성해주세요.' : 'Write in English.'

  const outlineText = outline
    .map(
      (item) => `
슬라이드 ${item.slideNumber}: ${item.title}
핵심 포인트:
${item.keyPoints.map((p) => `- ${p}`).join('\n')}
시각 제안: ${item.visualSuggestion}
${item.background ? `배경: ${item.background}` : ''}
${item.transition ? `전환: ${item.transition}` : ''}
${item.notes ? `노트: ${item.notes}` : ''}
  `.trim()
    )
    .join('\n\n')

  return `
테마: ${theme}
언어: ${languageInstruction}

아래 아웃라인을 기반으로 reveal.js 마크다운 슬라이드를 생성해주세요:

${outlineText}

반드시 reveal.js 마크다운 형식으로만 출력하세요. 다른 텍스트를 포함하지 마세요.
  `.trim()
}

/**
 * Planning 호출 실행
 */
export async function executePlanning(
  anthropic: Anthropic,
  options: AIGenerateOptions
): Promise<PlanningResult> {
  const model = process.env.AI_MODEL || 'claude-sonnet-4-5-20250929'
  const userPrompt = buildPlanningUserPrompt(options)

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
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from planning call')
  }

  try {
    const result = JSON.parse(content.text) as PlanningResult
    return result
  } catch (error) {
    throw new Error(
      `Failed to parse planning result: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Generation 호출 실행 (스트리밍)
 */
export async function executeGeneration(
  anthropic: Anthropic,
  outline: OutlineItem[],
  theme: string,
  language: 'ko' | 'en',
  controller: ReadableStreamDefaultController,
  encodeSSE: (event: SSEEvent) => string
): Promise<void> {
  const model = process.env.AI_MODEL || 'claude-sonnet-4-5-20250929'
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '4000', 10)
  const userPrompt = buildGenerationUserPrompt(outline, theme, language)

  const startTime = Date.now()
  let fullMarkdown = ''
  let currentSlideNumber = 1
  let tokensUsed = 0

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
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  stream.on('text', (text) => {
    fullMarkdown += text
    controller.enqueue(encodeSSE({ type: 'md_delta', content: text }))

    // 슬라이드 구분자 감지
    if (text.includes('\n---\n') || text.includes('\n---')) {
      currentSlideNumber++
      controller.enqueue(
        encodeSSE({ type: 'slide_complete', slideNumber: currentSlideNumber })
      )
    }
  })

  const message = await stream.finalMessage()
  tokensUsed = message.usage.input_tokens + message.usage.output_tokens

  const durationMs = Date.now() - startTime

  controller.enqueue(
    encodeSSE({
      type: 'complete',
      markdown: fullMarkdown,
      metadata: {
        totalSlides: currentSlideNumber,
        tokensUsed,
        durationMs,
        model,
      },
    })
  )
}
