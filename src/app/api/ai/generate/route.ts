import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { executePlanning, executeGeneration } from '@/lib/ai/pipeline'
import { encodeSSE } from '@/lib/ai/streamHelpers'
import type { AIGenerateOptions, OutlineItem } from '@/types/ai.types'

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const openai = new OpenAI({ apiKey })

  try {
    const body = await request.json()
    const {
      action,
      options,
      outline,
      theme,
      language,
    }: {
      action: 'plan' | 'generate'
      options?: AIGenerateOptions
      outline?: OutlineItem[]
      theme?: string
      language?: 'ko' | 'en'
    } = body

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (action === 'plan') {
            if (!options) {
              throw new Error('Missing options for planning')
            }

            controller.enqueue(encodeSSE({ type: 'planning_start' }))

            const result = await executePlanning(openai, options)

            controller.enqueue(
              encodeSSE({ type: 'planning_complete', data: result })
            )
          } else if (action === 'generate') {
            if (!outline || !theme || !language) {
              throw new Error('Missing parameters for generation')
            }

            controller.enqueue(encodeSSE({ type: 'generation_start' }))

            await executeGeneration(
              openai,
              outline,
              theme,
              language,
              controller,
              encodeSSE
            )
          } else {
            throw new Error(`Unknown action: ${action}`)
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error'
          controller.enqueue(
            encodeSSE({
              type: 'error',
              stage: action === 'plan' ? 'planning' : 'generation',
              message,
              retryable: true,
            })
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
