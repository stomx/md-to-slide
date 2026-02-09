import { create } from 'zustand'
import type { AIGenerateOptions, PlanningResult, OutlineItem } from '@/types/ai.types'

interface AIWizardState {
  isOpen: boolean
  currentStep: 1 | 2 | 3 | 4
  prompt: string
  options: Omit<AIGenerateOptions, 'prompt'>
  outline: OutlineItem[]
  planningResult: PlanningResult | null
  isPlanning: boolean
  isGenerating: boolean
  partialMarkdown: string
  generationProgress: number
  completedSlides: number
  error: string | null
  isLoading: boolean
}

interface AIWizardActions {
  openWizard: () => void
  closeWizard: () => void
  goToStep: (step: 1 | 2 | 3 | 4) => void
  updatePrompt: (prompt: string) => void
  updateOptions: (options: Partial<AIGenerateOptions>) => void
  setPlanningResult: (result: PlanningResult) => void
  setOutline: (outline: OutlineItem[]) => void
  editOutlineItem: (id: string, changes: Partial<OutlineItem>) => void
  reorderOutline: (fromIndex: number, toIndex: number) => void
  deleteOutlineItem: (id: string) => void
  addOutlineItem: (afterId: string) => void
  appendMarkdown: (chunk: string) => void
  setGenerationProgress: (progress: number) => void
  completeGeneration: (fullMarkdown: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setPlanning: (planning: boolean) => void
  reset: () => void
}

const initialState: AIWizardState = {
  isOpen: false,
  currentStep: 1,
  prompt: '',
  options: { slideCount: 5, theme: 'black', language: 'ko' },
  outline: [],
  planningResult: null,
  isPlanning: false,
  isGenerating: false,
  partialMarkdown: '',
  generationProgress: 0,
  completedSlides: 0,
  error: null,
  isLoading: false,
}

export const useAIWizardStore = create<AIWizardState & AIWizardActions>((set) => ({
  ...initialState,
  openWizard: () => set({ isOpen: true, currentStep: 1 }),
  closeWizard: () => set({ isOpen: false }),
  goToStep: (step) => set({ currentStep: step, error: null }),
  updatePrompt: (prompt) => set({ prompt }),
  updateOptions: (options) => set((s) => ({ options: { ...s.options, ...options } })),
  setPlanningResult: (result) => set({ planningResult: result, outline: result.outline, currentStep: 2 }),
  setOutline: (outline) => set({ outline }),
  editOutlineItem: (id, changes) => set((s) => ({
    outline: s.outline.map((item) => item.id === id ? { ...item, ...changes } : item),
  })),
  reorderOutline: (fromIndex, toIndex) => set((s) => {
    const newOutline = [...s.outline]
    const [moved] = newOutline.splice(fromIndex, 1)
    newOutline.splice(toIndex, 0, moved)
    return { outline: newOutline.map((item, i) => ({ ...item, slideNumber: i + 1 })) }
  }),
  deleteOutlineItem: (id) => set((s) => ({
    outline: s.outline.filter((item) => item.id !== id).map((item, i) => ({ ...item, slideNumber: i + 1 })),
  })),
  addOutlineItem: (afterId) => set((s) => {
    const idx = s.outline.findIndex((item) => item.id === afterId)
    const newItem: OutlineItem = {
      id: `slide-${Date.now()}`,
      slideNumber: idx + 2,
      title: '새 슬라이드',
      keyPoints: ['내용을 입력하세요'],
      visualSuggestion: '',
    }
    const newOutline = [...s.outline]
    newOutline.splice(idx + 1, 0, newItem)
    return { outline: newOutline.map((item, i) => ({ ...item, slideNumber: i + 1 })) }
  }),
  appendMarkdown: (chunk) => set((s) => ({ partialMarkdown: s.partialMarkdown + chunk })),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  completeGeneration: (fullMarkdown) => set({ isGenerating: false, partialMarkdown: fullMarkdown, generationProgress: 100 }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  setPlanning: (isPlanning) => set({ isPlanning }),
  reset: () => set(initialState),
}))
