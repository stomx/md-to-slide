import { describe, it, expect, vi } from 'vitest'
import { debounce, cn } from '../utils'

describe('debounce', () => {
  it('should delay function execution', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('test')
    expect(fn).not.toHaveBeenCalled()

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledWith('test')
  })

  it('should only execute once for rapid calls', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('a')
    debouncedFn('b')
    debouncedFn('c')

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('should reset timer on subsequent calls', async () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('first')
    await new Promise(resolve => setTimeout(resolve, 50))
    debouncedFn('second')
    await new Promise(resolve => setTimeout(resolve, 50))
    debouncedFn('third')
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('third')
  })
})

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('should filter falsy values', () => {
    expect(cn('a', undefined, null, false, 'b')).toBe('a b')
  })

  it('should return empty string for no valid classes', () => {
    expect(cn(undefined, null, false)).toBe('')
  })
})
