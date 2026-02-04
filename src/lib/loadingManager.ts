// lib/loadingManager.ts - Loading State Management Utilities

import { useSlideStore } from '@/store/slide-store'

export const withLoading = async <T,>(
  fn: () => Promise<T>,
  message: string,
  options?: {
    showProgress?: boolean
    onProgress?: (progress: number) => void
  }
): Promise<T> => {
  const { setLoading, setProgress } = useSlideStore.getState()

  setLoading(true, message)

  if (options?.showProgress) {
    setProgress(0)
  }

  try {
    const result = await fn()

    if (options?.showProgress) {
      setProgress(100)
    }

    return result
  } catch (error) {
    throw error
  } finally {
    setLoading(false)

    if (options?.showProgress) {
      // Reset progress after animation
      setTimeout(() => setProgress(0), 500)
    }
  }
}

export const setLoadingState = (isLoading: boolean, message?: string) => {
  const { setLoading } = useSlideStore.getState()
  setLoading(isLoading, message)
}

export const setProgressState = (progress: number) => {
  const { setProgress } = useSlideStore.getState()
  setProgress(progress)
}
