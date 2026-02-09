'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PROMPT_TEMPLATES } from '@/constants/promptTemplates'
import { BUILTIN_THEMES } from '@/constants/themes'
import { useAIWizardStore } from '@/store/ai-wizard-store'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { cn } from '@/lib/utils'

const SLIDE_COUNTS = [
  { value: '5', label: '5장' },
  { value: '8', label: '8장' },
  { value: '12', label: '12장' },
  { value: 'auto', label: '자동' },
]

const LANGUAGES = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
]

export const Step1PromptInput = () => {
  const { prompt, options, isLoading, updatePrompt, updateOptions } = useAIWizardStore()
  const { generatePlan } = useAIGenerate()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleTemplateClick = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    if (selectedTemplate === templateId) {
      setSelectedTemplate(null)
      updatePrompt('')
      updateOptions({ templateId: undefined })
    } else {
      setSelectedTemplate(templateId)
      updatePrompt(template.examplePrompt)
      updateOptions({ templateId })
    }
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return
    const slideCount = options.slideCount === 'auto' ? 'auto' : Number(options.slideCount)
    generatePlan({
      prompt: prompt.trim(),
      slideCount,
      theme: options.theme,
      language: options.language,
      templateId: options.templateId,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 템플릿 선택 */}
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">템플릿</label>
        <div className="grid grid-cols-2 gap-2">
          {PROMPT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateClick(template.id)}
              className={cn(
                'rounded-lg border p-2 text-left text-xs transition-all hover:border-blue-300 hover:bg-blue-50',
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 bg-white'
              )}
            >
              <span className="font-medium text-gray-800">{template.name}</span>
              <span className="mt-0.5 block text-[10px] text-gray-500">{template.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 프롬프트 입력 */}
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">프롬프트</label>
        <Textarea
          value={prompt}
          onChange={(e) => updatePrompt(e.target.value)}
          placeholder="어떤 발표를 만들고 싶으세요?"
          maxLength={1000}
          className="h-28 resize-none text-sm"
        />
        <p className="mt-1 text-right text-[10px] text-gray-400">
          {prompt.length}/1000
        </p>
      </div>

      {/* 옵션 */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-medium text-gray-500">슬라이드 수</label>
          <Select
            value={String(options.slideCount)}
            onValueChange={(v) => updateOptions({ slideCount: v === 'auto' ? 'auto' : Number(v) })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLIDE_COUNTS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium text-gray-500">테마</label>
          <Select
            value={options.theme}
            onValueChange={(v) => updateOptions({ theme: v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUILTIN_THEMES.map((theme) => (
                <SelectItem key={theme.name} value={theme.name} className="text-xs">
                  {theme.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium text-gray-500">언어</label>
          <Select
            value={options.language}
            onValueChange={(v) => updateOptions({ language: v as 'ko' | 'en' })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-xs">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 생성 버튼 */}
      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isLoading}
        className="w-full gap-2"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isLoading ? '아웃라인 생성 중...' : '아웃라인 생성'}
      </Button>
    </div>
  )
}
