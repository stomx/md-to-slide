import type { SSEEvent } from '@/types/ai.types'

/**
 * SSEEvent를 SSE 프로토콜 형식 문자열로 인코딩
 */
export function encodeSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

/**
 * SSE 프로토콜 문자열을 SSEEvent로 파싱
 */
export function parseSSE(data: string): SSEEvent | null {
  const trimmed = data.trim()
  if (!trimmed.startsWith('data: ')) return null

  try {
    const json = trimmed.slice('data: '.length)
    return JSON.parse(json) as SSEEvent
  } catch {
    return null
  }
}
