// lib/errorHandler.ts - Error Handling Utilities

import { showToast } from '@/components/Toast'

export class MarkdownParsingError extends Error {
  lineNumber?: number

  constructor(message: string, lineNumber?: number) {
    super(message)
    this.name = 'MarkdownParsingError'
    this.lineNumber = lineNumber
  }
}

export class ExportError extends Error {
  recoverable: boolean

  constructor(message: string, recoverable = true) {
    super(message)
    this.name = 'ExportError'
    this.recoverable = recoverable
  }
}

export const handleError = (
  error: unknown,
  context: string,
  options?: {
    showToast?: boolean
    onRetry?: () => void
  }
) => {
  const { showToast: shouldShowToast = true, onRetry } = options || {}

  let errorMessage = `${context} failed`

  if (error instanceof MarkdownParsingError) {
    errorMessage = error.lineNumber
      ? `${context} failed at line ${error.lineNumber}: ${error.message}`
      : `${context} failed: ${error.message}`
  } else if (error instanceof ExportError) {
    errorMessage = `${context} failed: ${error.message}`
  } else if (error instanceof Error) {
    errorMessage = `${context} failed: ${error.message}`
  } else {
    errorMessage = `${context} failed: Unknown error`
  }

  console.error(`[${context}]`, error)

  if (shouldShowToast) {
    if (onRetry && error instanceof ExportError && error.recoverable) {
      showToast.error(errorMessage, {
        action: {
          label: 'Retry',
          onClick: onRetry,
        },
      })
    } else {
      showToast.error(errorMessage)
    }
  }

  return errorMessage
}

export const withErrorHandling = async <T,>(
  fn: () => Promise<T>,
  context: string,
  options?: {
    onRetry?: () => void
  }
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    handleError(error, context, options)
    throw error
  }
}
