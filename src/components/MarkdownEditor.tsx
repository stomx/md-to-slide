'use client'

import React, { useEffect, useCallback } from 'react'
import { useSlideStore } from '@/store/slide-store'
import { Textarea } from './ui/textarea'
import { debounce } from '@/lib/utils'
import { parseMarkdownToSlides } from '@/lib/markdownParser'
import { DEBOUNCE_DELAY } from '@/constants/defaults'

/**
 * MarkdownEditor 컴포넌트
 *
 * 마크다운 입력 에디터
 * - 실시간 입력
 * - Debounce 처리 (300ms)
 * - 자동 파싱 트리거
 */
export function MarkdownEditor() {
  const { markdown, setMarkdown, setSlides } = useSlideStore()

  // Debounced 파싱 함수
  const debouncedParse = useCallback(
    debounce((text: string) => {
      const parsedSlides = parseMarkdownToSlides(text)
      setSlides(parsedSlides)
    }, DEBOUNCE_DELAY),
    [setSlides]
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
    const parsedSlides = parseMarkdownToSlides(markdown)
    console.log('Parsed slides:', parsedSlides.length, 'slides')
    setSlides(parsedSlides)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col bg-white text-gray-900">
      <div className="border-b bg-gray-50 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Markdown Editor</h2>
        <p className="text-sm text-gray-600">
          Use <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-gray-800">---</code> for
          horizontal slides,{' '}
          <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-gray-800">-----</code> for
          vertical
        </p>
      </div>
      <div className="flex-1 p-4 bg-white">
        <Textarea
          id="markdown-editor"
          value={markdown}
          onChange={handleChange}
          placeholder="# Your Presentation Title&#10;&#10;---&#10;&#10;## Slide 2"
          className="h-full resize-none font-mono text-sm bg-white text-gray-900 border-gray-300"
        />
      </div>
    </div>
  )
}
