import { describe, it, expect } from 'vitest'
import { parseMarkdownToSlides, slidesToRevealHTML } from '../markdownParser'

describe('parseMarkdownToSlides', () => {
  it('should parse single slide', () => {
    const slides = parseMarkdownToSlides('# Hello')
    expect(slides).toHaveLength(1)
    expect(slides[0].content).toBe('# Hello')
    expect(slides[0].type).toBe('horizontal')
    expect(slides[0].order).toBe(0)
  })

  it('should split horizontal slides by ---', () => {
    const markdown = '# Slide 1\n\n---\n\n# Slide 2'
    const slides = parseMarkdownToSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0].content).toBe('# Slide 1')
    expect(slides[1].content).toBe('# Slide 2')
    expect(slides[0].type).toBe('horizontal')
    expect(slides[1].type).toBe('horizontal')
  })

  it('should handle vertical slides (-----)', () => {
    const markdown = '# Slide 1\n\n-----\n\n# Slide 1.1'
    const slides = parseMarkdownToSlides(markdown)

    expect(slides).toHaveLength(2)
    expect(slides[0].type).toBe('horizontal')
    expect(slides[1].type).toBe('vertical')
    expect(slides[0].sectionId).toBe(slides[1].sectionId)
  })

  it('should generate unique IDs per slide', () => {
    const markdown = '# A\n---\n# B\n---\n# C'
    const slides = parseMarkdownToSlides(markdown)

    const ids = slides.map(s => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should skip empty slides', () => {
    const markdown = '# Slide 1\n---\n\n---\n# Slide 3'
    const slides = parseMarkdownToSlides(markdown)

    expect(slides.every(s => s.content.length > 0)).toBe(true)
  })

  it('should convert markdown to HTML', () => {
    const slides = parseMarkdownToSlides('# Hello World')

    expect(slides[0].html).toContain('<h1')
    expect(slides[0].html).toContain('Hello World')
  })

  it('should assign correct order', () => {
    const markdown = '# A\n\n---\n\n# B\n\n---\n\n# C'
    const slides = parseMarkdownToSlides(markdown)

    expect(slides[0].order).toBe(0)
    expect(slides[1].order).toBe(1)
    expect(slides[2].order).toBe(2)
  })

  it('should assign section IDs', () => {
    const markdown = '# A\n\n---\n\n# B\n\n-----\n\n# B.1'
    const slides = parseMarkdownToSlides(markdown)

    expect(slides[0].sectionId).toBe('section-0')
    expect(slides[1].sectionId).toBe('section-1')
    expect(slides[2].sectionId).toBe('section-1')
  })
})

describe('slidesToRevealHTML', () => {
  it('should return fallback for empty slides', () => {
    const html = slidesToRevealHTML([])
    expect(html).toContain('No slides yet')
  })

  it('should wrap single slide in section', () => {
    const slides = parseMarkdownToSlides('# Hello')
    const html = slidesToRevealHTML(slides)

    expect(html).toContain('<section>')
    expect(html).toContain('Hello')
  })

  it('should create nested sections for vertical slides', () => {
    const slides = parseMarkdownToSlides('# A\n\n-----\n\n# B')
    const html = slidesToRevealHTML(slides)

    const sectionCount = (html.match(/<section>/g) || []).length
    expect(sectionCount).toBeGreaterThanOrEqual(3) // outer + 2 inner
  })
})
