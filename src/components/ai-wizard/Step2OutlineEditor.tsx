'use client'

import { ArrowLeft, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAIWizardStore } from '@/store/ai-wizard-store'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { OutlineItemCard } from './OutlineItem'

export const Step2OutlineEditor = () => {
  const { outline, options, isLoading, editOutlineItem, deleteOutlineItem, addOutlineItem, reorderOutline, goToStep } =
    useAIWizardStore()
  const { generateSlides } = useAIGenerate()

  const handleTitleChange = (id: string, title: string) => {
    editOutlineItem(id, { title })
  }

  const handleKeyPointChange = (id: string, pointIndex: number, value: string) => {
    const item = outline.find((o) => o.id === id)
    if (!item) return
    const newPoints = [...item.keyPoints]
    newPoints[pointIndex] = value
    editOutlineItem(id, { keyPoints: newPoints })
  }

  const handleAddKeyPoint = (id: string) => {
    const item = outline.find((o) => o.id === id)
    if (!item) return
    editOutlineItem(id, { keyPoints: [...item.keyPoints, ''] })
  }

  const handleRemoveKeyPoint = (id: string, pointIndex: number) => {
    const item = outline.find((o) => o.id === id)
    if (!item || item.keyPoints.length <= 1) return
    const newPoints = item.keyPoints.filter((_, i) => i !== pointIndex)
    editOutlineItem(id, { keyPoints: newPoints })
  }

  const handleGenerate = () => {
    generateSlides(outline, options.theme, options.language)
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          아웃라인 ({outline.length}장)
        </h3>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3 w-3" />
          다시 생성
        </button>
      </div>

      {/* 아웃라인 목록 */}
      <div className="flex flex-col gap-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        {outline.map((item, index) => (
          <OutlineItemCard
            key={item.id}
            item={item}
            index={index}
            totalItems={outline.length}
            onTitleChange={handleTitleChange}
            onKeyPointChange={handleKeyPointChange}
            onAddKeyPoint={handleAddKeyPoint}
            onRemoveKeyPoint={handleRemoveKeyPoint}
            onReorder={reorderOutline}
            onDelete={deleteOutlineItem}
            onAddSlide={addOutlineItem}
          />
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToStep(3)}
          className="flex-1 text-xs"
        >
          상세 보기
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
