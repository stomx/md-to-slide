'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAIWizardStore } from '@/store/ai-wizard-store'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { cn } from '@/lib/utils'

export const Step3DetailedPlan = () => {
  const { outline, planningResult, options, isLoading, goToStep } = useAIWizardStore()
  const { generateSlides } = useAIGenerate()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleGenerate = () => {
    generateSlides(outline, options.theme, options.language)
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* 전략 요약 */}
      {planningResult && (
        <div className="rounded-lg bg-blue-50 p-3">
          <h4 className="text-xs font-semibold text-blue-800 mb-1">전략 요약</h4>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            {planningResult.strategy.storyline}
          </p>
          <div className="mt-2 flex gap-2">
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
              {planningResult.strategy.flow}
            </span>
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
              {planningResult.strategy.tone}
            </span>
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
              {planningResult.analysis.depth}
            </span>
          </div>
        </div>
      )}

      {/* 아코디언 목록 */}
      <div className="flex flex-col gap-1.5 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
        {outline.map((item) => {
          const isExpanded = expandedIds.has(item.id)
          return (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="flex w-full items-center gap-2 p-2.5 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                )}
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600">
                  {item.slideNumber}
                </span>
                <span className="flex-1 text-xs font-medium text-gray-800 truncate">
                  {item.title}
                </span>
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="border-t border-gray-100 px-3 pb-3 pt-2">
                  {/* Key Points */}
                  <div className="mb-2">
                    <span className="text-[10px] font-medium text-gray-500">핵심 포인트</span>
                    <ul className="mt-1 space-y-0.5">
                      {item.keyPoints.map((point, pi) => (
                        <li key={pi} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-gray-300 mt-0.5">-</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Suggestion */}
                  {item.visualSuggestion && (
                    <div>
                      <span className="text-[10px] font-medium text-gray-500">시각적 제안</span>
                      <p className="mt-0.5 text-xs text-gray-500 italic">
                        {item.visualSuggestion}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <div className="mt-1">
                      <span className="text-[10px] font-medium text-gray-500">발표 노트</span>
                      <p className="mt-0.5 text-xs text-gray-500">{item.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToStep(2)}
          className="flex-1 text-xs"
        >
          아웃라인 편집
        </Button>
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={isLoading || outline.length === 0}
          className="flex-1 gap-1.5 text-xs"
        >
          <Wand2 className="h-3.5 w-3.5" />
          슬라이드 생성
        </Button>
      </div>
    </div>
  )
}
