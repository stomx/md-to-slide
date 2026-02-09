'use client'

import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OutlineItem as OutlineItemType } from '@/types/ai.types'

interface OutlineItemProps {
  item: OutlineItemType
  index: number
  totalItems: number
  onTitleChange: (id: string, title: string) => void
  onKeyPointChange: (id: string, pointIndex: number, value: string) => void
  onAddKeyPoint: (id: string) => void
  onRemoveKeyPoint: (id: string, pointIndex: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onDelete: (id: string) => void
  onAddSlide: (afterId: string) => void
}

export const OutlineItemCard = ({
  item,
  index,
  totalItems,
  onTitleChange,
  onKeyPointChange,
  onAddKeyPoint,
  onRemoveKeyPoint,
  onReorder,
  onDelete,
  onAddSlide,
}: OutlineItemProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm">
      {/* 슬라이드 번호 + 제목 */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col shrink-0">
          <button
            type="button"
            onClick={() => {
              if (index > 0) onReorder(index, index - 1)
            }}
            disabled={index === 0}
            className="text-gray-300 hover:text-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700">
            {item.slideNumber}
          </span>
          <button
            type="button"
            onClick={() => {
              if (index < totalItems - 1) onReorder(index, index + 1)
            }}
            disabled={index === totalItems - 1}
            className="text-gray-300 hover:text-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <input
          type="text"
          value={item.title}
          onChange={(e) => onTitleChange(item.id, e.target.value)}
          className="flex-1 border-none bg-transparent text-sm font-medium text-gray-800 outline-none focus:ring-0 p-0"
          placeholder="슬라이드 제목"
        />
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={totalItems <= 1}
          className={cn(
            'shrink-0 p-0.5 text-gray-400 transition-colors hover:text-red-500',
            totalItems <= 1 && 'opacity-30 cursor-not-allowed hover:text-gray-400'
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Key Points */}
      <div className="mt-2 ml-7 flex flex-col gap-1">
        {item.keyPoints.map((point, pi) => (
          <div key={pi} className="flex items-center gap-1 group">
            <span className="text-[10px] text-gray-300">-</span>
            <input
              type="text"
              value={point}
              onChange={(e) => onKeyPointChange(item.id, pi, e.target.value)}
              className="flex-1 border-none bg-transparent text-xs text-gray-600 outline-none focus:ring-0 p-0"
              placeholder="핵심 포인트"
            />
            <button
              type="button"
              onClick={() => onRemoveKeyPoint(item.id, pi)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-400 transition-opacity"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAddKeyPoint(item.id)}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-500 mt-0.5"
        >
          <Plus className="h-2.5 w-2.5" />
          포인트 추가
        </button>
      </div>

      {/* 슬라이드 추가 버튼 */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onAddSlide(item.id)}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-500"
        >
          <Plus className="h-3 w-3" />
          아래에 슬라이드 추가
        </button>
      </div>
    </div>
  )
}
