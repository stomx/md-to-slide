'use client'

import React, { useEffect, useCallback } from 'react'

import { useSlideStore } from '@/store/slide-store'
import { debounce } from '@/lib/utils'
import { parseMarkdownToSlides } from '@/lib/markdownParser'
import { handleError } from '@/lib/errorHandler'
import { DEBOUNCE_DELAY } from '@/constants/defaults'

import { LoadingSpinner } from './LoadingSpinner'
import { showToast } from './Toast'

/**
 * MarkdownEditor 컴포넌트 (v0.4.0 - 다크 테마)
 *
 * 다크 사이드바 내 마크다운 입력 에디터
 * - 다크 배경 + 밝은 텍스트
 * - JetBrains Mono 폰트
 * - 슬라이드 소스 헤더
 */
export function MarkdownEditor() {
  const {
    markdown,
    setMarkdown,
    setSlides,
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
    currentSlideIndex,
  } = useSlideStore()

  const debouncedParse = useCallback(
    debounce(async (text: string) => {
      setLoading(true, 'Parsing markdown...')
      clearError()

      try {
        const parsedSlides = parseMarkdownToSlides(text)
        setSlides(parsedSlides)
        showToast.success(`${parsedSlides.length} slides parsed`)
      } catch (err) {
        const result = handleError(err, 'Markdown parsing')
        setError(result.message)
        showToast.error(result.message)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_DELAY),
    [setSlides, setLoading, setError, clearError]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value
    setMarkdown(newMarkdown)
    debouncedParse(newMarkdown)
  }

  useEffect(() => {
    try {
      const parsedSlides = parseMarkdownToSlides(markdown)
      setSlides(parsedSlides)
    } catch (err) {
      const result = handleError(err, 'Initial markdown parsing')
      setError(result.message)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full">
      {/* Slide Source Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-sidebar-darker border-b border-gray-800 text-xs uppercase tracking-wider font-semibold text-gray-500">
        <span>Slide {currentSlideIndex + 1} Source</span>
        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-mono">MD</span>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <label htmlFor="markdown-editor" className="sr-only">
          Markdown Editor
        </label>
        <textarea
          id="markdown-editor"
          value={markdown}
          onChange={handleChange}
          placeholder="# Your Presentation Title&#10;&#10;---&#10;&#10;## Slide 2"
          className="w-full h-full bg-sidebar-dark p-6 font-mono text-sm leading-relaxed text-gray-300 resize-none focus:outline-none focus:ring-0 border-none selection:bg-primary/30"
          spellCheck={false}
          aria-label="Markdown editor"
          aria-invalid={!!error}
          aria-busy={isLoading}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-sidebar-dark/50 flex items-center justify-center">
            <LoadingSpinner size="md" message="Parsing markdown..." />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="absolute bottom-4 left-4 right-4 bg-red-900/80 border border-red-700 text-red-200 px-4 py-3 rounded shadow-lg"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={clearError}
              className="absolute top-2 right-2 text-red-300 hover:text-red-100"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
