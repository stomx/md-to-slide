import { describe, it, expect, beforeEach } from 'vitest'
import { useSlideStore } from '@/store/slide-store'
import { parseMarkdownToSlides } from '@/lib/markdownParser'

/**
 * Store ↔ MarkdownParser Integration Test
 *
 * MarkdownEditor 컴포넌트의 핵심 흐름을 Store 레벨에서 검증:
 * setMarkdown() → parseMarkdownToSlides() → setSlides()
 */
describe('Store ↔ MarkdownParser Integration', () => {
  beforeEach(() => {
    useSlideStore.getState().reset()
  })

  it('should parse markdown and update slides in store', () => {
    const store = useSlideStore.getState()
    const markdown = '# Slide 1\n\n---\n\n# Slide 2'

    store.setMarkdown(markdown)
    const slides = parseMarkdownToSlides(markdown)
    store.setSlides(slides)

    const state = useSlideStore.getState()
    expect(state.markdown).toBe(markdown)
    expect(state.slides).toHaveLength(2)
    expect(state.isDirty).toBe(true)
  })

  it('should handle the full editor flow: input → parse → store', () => {
    const store = useSlideStore.getState()
    const markdown = '# Title\n\n---\n\n## Content\n\n-----\n\n### Sub-content'

    // MarkdownEditor handleChange flow
    store.setMarkdown(markdown)
    store.setLoading(true, 'Parsing markdown...')
    store.clearError()

    const slides = parseMarkdownToSlides(markdown)
    store.setSlides(slides)
    store.setLoading(false)

    const state = useSlideStore.getState()
    expect(state.slides).toHaveLength(3)
    expect(state.slides[0].type).toBe('horizontal')
    expect(state.slides[2].type).toBe('vertical')
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should handle error flow when parsing fails', () => {
    const store = useSlideStore.getState()

    store.setLoading(true, 'Parsing markdown...')
    store.setError('Parsing failed: invalid markdown')
    store.setLoading(false)

    const state = useSlideStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Parsing failed: invalid markdown')
  })

  it('should reset v1.0.0 state to initial values', () => {
    const store = useSlideStore.getState()

    store.setMarkdown('# Modified')
    store.setSlides(parseMarkdownToSlides('# Modified'))

    store.reset()

    const state = useSlideStore.getState()
    expect(state.isDirty).toBe(false)
    expect(state.slides).toHaveLength(0)
  })
})
