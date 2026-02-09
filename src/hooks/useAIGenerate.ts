import { useCallback, useRef } from 'react'
import { useAIWizardStore } from '@/store/ai-wizard-store'
import { useSlideStore } from '@/store/slide-store'
import { parseSSE } from '@/lib/ai/streamHelpers'
import type { AIGenerateOptions, OutlineItem, SSEEvent } from '@/types/ai.types'

export function useAIGenerate() {
  const abortRef = useRef<AbortController | null>(null)
  const lastActionRef = useRef<{ type: 'plan'; options: AIGenerateOptions } | { type: 'generate'; outline: OutlineItem[]; theme: string; language: string } | null>(null)
  const store = useAIWizardStore()
  const { setMarkdown } = useSlideStore()

  const processSSEStream = useCallback(async (
    response: Response,
    onEvent: (event: SSEEvent) => void
  ) => {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const event = parseSSE(line)
        if (event) onEvent(event)
      }
    }
  }, [])

  const generatePlan = useCallback(async (options: AIGenerateOptions) => {
    abortRef.current = new AbortController()
    lastActionRef.current = { type: 'plan', options }
    store.setPlanning(true)
    store.setLoading(true)
    store.setError(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'plan', options }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      await processSSEStream(response, (event) => {
        if (event.type === 'planning_complete') {
          store.setPlanningResult(event.data)
        } else if (event.type === 'error') {
          store.setError(event.message)
        }
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        store.setError((err as Error).message)
      }
    } finally {
      store.setPlanning(false)
      store.setLoading(false)
    }
  }, [store, processSSEStream])

  const generateSlides = useCallback(async (
    outline: OutlineItem[],
    theme: string,
    language: string
  ) => {
    abortRef.current = new AbortController()
    lastActionRef.current = { type: 'generate', outline, theme, language }
    store.setLoading(true)
    store.setError(null)
    store.goToStep(4)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', outline, theme, language }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      await processSSEStream(response, (event) => {
        switch (event.type) {
          case 'md_delta':
            store.appendMarkdown(event.content)
            break
          case 'slide_complete':
            store.setGenerationProgress(
              Math.round((event.slideNumber / outline.length) * 100)
            )
            break
          case 'complete':
            store.completeGeneration(event.markdown)
            setMarkdown(event.markdown)
            break
          case 'error':
            store.setError(event.message)
            break
        }
      })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        store.setError((err as Error).message)
      }
    } finally {
      store.setLoading(false)
    }
  }, [store, setMarkdown, processSSEStream])

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const retry = useCallback(() => {
    const last = lastActionRef.current
    if (!last) return
    store.setError(null)
    if (last.type === 'plan') {
      generatePlan(last.options)
    } else {
      generateSlides(last.outline, last.theme, last.language)
    }
  }, [store, generatePlan, generateSlides])

  return { generatePlan, generateSlides, abort, retry }
}
