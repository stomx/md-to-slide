'use client'

import { X } from 'lucide-react'
import { useAIWizardStore } from '@/store/ai-wizard-store'
import { useSlideStore } from '@/store/slide-store'
import { StepIndicator } from './StepIndicator'
import { Step1PromptInput } from './Step1PromptInput'
import { Step2OutlineEditor } from './Step2OutlineEditor'
import { Step3DetailedPlan } from './Step3DetailedPlan'
import { Step4Generation } from './Step4Generation'

export const AIWizardPanel = () => {
  const { currentStep, error, closeWizard, goToStep } = useAIWizardStore()
  const { setEditorMode } = useSlideStore()

  const handleClose = () => {
    closeWizard()
    setEditorMode('markdown')
  }

  return (
    <div className="h-full flex-shrink-0 bg-gray-50 overflow-hidden flex flex-col">
      <div className="flex h-full flex-col">
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-sm font-bold text-gray-800">AI 슬라이드 생성</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 단계 표시기 */}
        <div className="border-b border-gray-200 bg-white">
          <StepIndicator currentStep={currentStep} onStepClick={goToStep} />
        </div>

        {/* 에러 표시 */}
        {error && currentStep !== 4 && (
          <div className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* 단계별 컨텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 && <Step1PromptInput />}
          {currentStep === 2 && <Step2OutlineEditor />}
          {currentStep === 3 && <Step3DetailedPlan />}
          {currentStep === 4 && <Step4Generation />}
        </div>
      </div>
    </div>
  )
}
