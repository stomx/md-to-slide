'use client'

import React, { useEffect, useCallback } from 'react'
import { useSlideStore } from '@/store/slide-store'
import { Textarea } from './ui/textarea'
import { debounce } from '@/lib/utils'
import { parseMarkdownToSlides } from '@/lib/markdownParser'
import { DEBOUNCE_DELAY } from '@/constants/defaults'
import { LoadingSpinner } from './LoadingSpinner'
import { handleError, MarkdownParsingError } from '@/lib/errorHandler'
import { showToast } from './Toast'

/**
 * MarkdownEditor 컴포넌트
 *
 * 마크다운 입력 에디터
 * - 실시간 입력
 * - Debounce 처리 (300ms)
 * - 자동 파싱 트리거
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
  } = useSlideStore()

  // Debounced 파싱 함수 with error handling
  const debouncedParse = useCallback(
    debounce(async (text: string) => {
      setLoading(true, 'Parsing markdown...')
      clearError()

      try {
        const parsedSlides = parseMarkdownToSlides(text)
        setSlides(parsedSlides)
        showToast.success(`${parsedSlides.length} slides parsed`)
      } catch (err) {
        const errorMessage = handleError(err, 'Markdown parsing')
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_DELAY),
    [setSlides, setLoading, setError, clearError]
  )

  // 마크다운 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMarkdown = e.target.value
    setMarkdown(newMarkdown)
    debouncedParse(newMarkdown)
  }

  // 초기 파싱
  useEffect(() => {
    console.log('Initial markdown:', markdown.substring(0, 50) + '...')

    try {
      const parsedSlides = parseMarkdownToSlides(markdown)
      console.log('Parsed slides:', parsedSlides.length, 'slides')
      setSlides(parsedSlides)
    } catch (err) {
      handleError(err, 'Initial markdown parsing')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex h-full flex-col bg-white text-gray-900">
      <div className="border-b bg-gray-50 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Markdown Editor</h2>
        <p id="editor-help" className="text-sm text-gray-600">
          Use <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-gray-800">---</code> for
          horizontal slides,{' '}
          <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-gray-800">-----</code> for
          vertical
        </p>
      </div>
      <div className="flex-1 p-4 bg-white relative">
        <label htmlFor="markdown-editor" className="sr-only">
          Markdown Editor
        </label>
        <Textarea
          id="markdown-editor"
          value={markdown}
          onChange={handleChange}
          placeholder="# Your Presentation Title&#10;&#10;---&#10;&#10;## Slide 2"
          className="h-full resize-none font-mono text-sm bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Markdown editor"
          aria-describedby="editor-help"
          aria-invalid={!!error}
          aria-busy={isLoading}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <LoadingSpinner size="md" message="Parsing markdown..." />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={clearError}
              className="absolute top-2 right-2 text-red-700 hover:text-red-900"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
