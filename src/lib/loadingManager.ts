// lib/loadingManager.ts - Loading State Management Utilities

interface LoadingActions {
  setLoading: (isLoading: boolean, message?: string) => void
  setProgress: (progress: number) => void
}

export const withLoading = async <T,>(
  fn: () => Promise<T>,
  message: string,
  actions: LoadingActions,
  options?: {
    showProgress?: boolean
    onProgress?: (progress: number) => void
  }
): Promise<T> => {
  actions.setLoading(true, message)

  if (options?.showProgress) {
    actions.setProgress(0)
  }

  try {
    const result = await fn()

    if (options?.showProgress) {
      actions.setProgress(100)
    }

    return result
  } catch (error) {
    throw error
  } finally {
    actions.setLoading(false)

    if (options?.showProgress) {
      // Reset progress after animation
      setTimeout(() => actions.setProgress(0), 500)
    }
  }
}

export const setLoadingState = (
  isLoading: boolean,
  actions: Pick<LoadingActions, 'setLoading'>,
  message?: string
) => {
  actions.setLoading(isLoading, message)
}

export const setProgressState = (
  progress: number,
  actions: Pick<LoadingActions, 'setProgress'>
) => {
  actions.setProgress(progress)
}
