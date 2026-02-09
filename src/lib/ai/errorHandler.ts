export const ERROR_RECOVERY = {
  planning_fail: {
    maxRetries: 2,
    strategy: 'retry_same',
    fallback: 'show_error',
    userMessage: '아웃라인 생성에 실패했습니다. 다시 시도해주세요.',
  },
  generation_fail: {
    maxRetries: 2,
    strategy: 'retry_with_outline',
    fallback: 'partial_result',
    userMessage: '슬라이드 생성 중 오류가 발생했습니다.',
  },
  generation_partial: {
    strategy: 'keep_partial',
    userMessage: '일부 슬라이드만 생성되었습니다. 나머지는 직접 작성해주세요.',
  },
  rate_limit: {
    strategy: 'wait_and_retry',
    retryAfterMs: 60000,
    userMessage: 'API 요청 한도에 도달했습니다. 1분 후 다시 시도해주세요.',
  },
  network_error: {
    maxRetries: 3,
    retryDelayMs: [1000, 3000, 5000],
    userMessage: '네트워크 연결을 확인해주세요.',
  },
} as const

export type ErrorRecoveryKey = keyof typeof ERROR_RECOVERY

/**
 * Error를 분류하여 ERROR_RECOVERY 키로 매핑
 */
export function classifyError(error: Error): ErrorRecoveryKey {
  const message = error.message.toLowerCase()

  if (message.includes('rate') || message.includes('429')) {
    return 'rate_limit'
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('econnrefused') ||
    message.includes('timeout')
  ) {
    return 'network_error'
  }

  if (message.includes('planning') || message.includes('outline')) {
    return 'planning_fail'
  }

  if (message.includes('partial')) {
    return 'generation_partial'
  }

  return 'generation_fail'
}

/**
 * 재시도 지연 시간 계산
 */
export function getRetryDelay(
  errorKey: ErrorRecoveryKey,
  attemptNumber: number
): number {
  const config = ERROR_RECOVERY[errorKey]

  if ('retryAfterMs' in config) {
    return config.retryAfterMs
  }

  if ('retryDelayMs' in config && Array.isArray(config.retryDelayMs)) {
    const index = Math.min(attemptNumber, config.retryDelayMs.length - 1)
    return config.retryDelayMs[index]
  }

  return 1000
}
