'use client'

import { CheckCircle, AlertCircle, RotateCcw, FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ProgressBar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAIWizardStore } from '@/store/ai-wizard-store'
import { useAIGenerate } from '@/hooks/useAIGenerate'

export const Step4Generation = () => {
  const {
    generationProgress,
    partialMarkdown,
    isLoading,
    error,
    outline,
    options,
    closeWizard,
    goToStep,
  } = useAIWizardStore()
  const { generateSlides } = useAIGenerate()

  const isComplete = generationProgress >= 100 && !isLoading
  const previewText = partialMarkdown.slice(-200)

  const handleRetry = () => {
    generateSlides(outline, options.theme, options.language)
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-800">생성 실패</h3>
          <p className="mt-1 text-xs text-red-500">{error}</p>
        </div>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToStep(2)}
            className="flex-1 text-xs"
          >
            아웃라인으로
          </Button>
          <Button
            size="sm"
            onClick={handleRetry}
            className="flex-1 gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  // 완료 상태
  if (isComplete) {
    const slideCount = partialMarkdown.split(/\n---\n/).length
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <CheckCircle className="h-10 w-10 text-green-500" />
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-800">생성 완료!</h3>
          <p className="mt-1 text-xs text-gray-500">
            {slideCount}장의 슬라이드가 생성되었습니다
          </p>
        </div>
        <div className="w-full rounded-lg bg-gray-50 p-3">
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>슬라이드 수</span>
            <span className="font-medium text-gray-700">{slideCount}장</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>테마</span>
            <span className="font-medium text-gray-700">{options.theme}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>언어</span>
            <span className="font-medium text-gray-700">
              {options.language === 'ko' ? '한국어' : 'English'}
            </span>
          </div>
        </div>
        <Button
          onClick={closeWizard}
          className="w-full gap-1.5"
          size="sm"
        >
          <FileEdit className="h-3.5 w-3.5" />
          에디터에서 편집
        </Button>
      </div>
    )
  }

  // 생성 중
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="md" />
        <h3 className="text-sm font-semibold text-gray-800">슬라이드 생성 중...</h3>
      </div>

      <ProgressBar
        progress={generationProgress}
        message={`${outline.length}장 중 ${Math.round((generationProgress / 100) * outline.length)}장 완료`}
      />

      {/* 스트리밍 미리보기 */}
      {previewText && (
        <div className="rounded-lg bg-gray-900 p-3 max-h-40 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 mb-1">미리보기</p>
          <pre className="text-[11px] text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
            {previewText}
          </pre>
        </div>
      )}
    </div>
  )
}
