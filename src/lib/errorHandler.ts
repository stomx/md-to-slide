// lib/errorHandler.ts - Error Handling Utilities

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

export interface ErrorResult {
  message: string
  recoverable: boolean
  retry?: () => void
}

export const handleError = (
  error: unknown,
  context: string,
  options?: {
    onRetry?: () => void
  }
): ErrorResult => {
  let errorMessage = `${context} failed`
  let recoverable = false

  if (error instanceof MarkdownParsingError) {
    errorMessage = error.lineNumber
      ? `${context} failed at line ${error.lineNumber}: ${error.message}`
      : `${context} failed: ${error.message}`
  } else if (error instanceof ExportError) {
    errorMessage = `${context} failed: ${error.message}`
    recoverable = error.recoverable
  } else if (error instanceof Error) {
    errorMessage = `${context} failed: ${error.message}`
  } else {
    errorMessage = `${context} failed: Unknown error`
  }

  console.error(`[${context}]`, error)

  return {
    message: errorMessage,
    recoverable,
    retry: recoverable ? options?.onRetry : undefined,
  }
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
