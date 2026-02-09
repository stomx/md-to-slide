import OpenAI from 'openai'
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
  openai: OpenAI,
  options: AIGenerateOptions
): Promise<PlanningResult> {
  const model = process.env.AI_MODEL || 'gpt-4o'
  const userPrompt = buildPlanningUserPrompt(options)

  const response = await openai.chat.completions.create({
    model,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: PLANNING_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('Empty response from planning call')
  }

  try {
    const result = JSON.parse(content) as PlanningResult
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
  openai: OpenAI,
  outline: OutlineItem[],
  theme: string,
  language: 'ko' | 'en',
  controller: ReadableStreamDefaultController,
  encodeSSE: (event: SSEEvent) => string
): Promise<void> {
  const model = process.env.AI_MODEL || 'gpt-4o'
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '4000', 10)
  const userPrompt = buildGenerationUserPrompt(outline, theme, language)

  const startTime = Date.now()
  let fullMarkdown = ''
  let currentSlideNumber = 1
  let tokensUsed = 0

  const stream = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      {
        role: 'system',
        content: GENERATOR_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  for await (const chunk of stream) {
    if (chunk.usage) {
      tokensUsed = chunk.usage.prompt_tokens + chunk.usage.completion_tokens
      continue
    }

    const text = chunk.choices[0]?.delta?.content
    if (!text) continue

    fullMarkdown += text
    controller.enqueue(encodeSSE({ type: 'md_delta', content: text }))

    // 슬라이드 구분자 감지
    if (text.includes('\n---\n') || text.includes('\n---')) {
      currentSlideNumber++
      controller.enqueue(
        encodeSSE({ type: 'slide_complete', slideNumber: currentSlideNumber })
      )
    }
  }

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
