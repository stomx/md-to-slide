'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { number: 1, label: '프롬프트 입력' },
  { number: 2, label: '아웃라인 편집' },
  { number: 3, label: '상세 계획' },
  { number: 4, label: '생성' },
] as const

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4
  onStepClick: (step: 1 | 2 | 3 | 4) => void
}

export const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between px-2 py-3">
      {STEPS.map((step, idx) => {
        const isCompleted = step.number < currentStep
        const isCurrent = step.number === currentStep
        const isClickable = step.number < currentStep

        return (
          <div key={step.number} className="flex items-center">
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.number as 1 | 2 | 3 | 4)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                isClickable && 'cursor-pointer hover:text-blue-700',
                !isClickable && !isCurrent && 'cursor-default',
                isCurrent && 'text-blue-600',
                isCompleted && 'text-green-600',
                !isCurrent && !isCompleted && 'text-gray-400'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                  isCurrent && 'bg-blue-600 text-white',
                  isCompleted && 'bg-green-500 text-white',
                  !isCurrent && !isCompleted && 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-px w-4 sm:w-6',
                  step.number < currentStep ? 'bg-green-400' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
