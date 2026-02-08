/**
 * Utility Functions
 */

/**
 * Debounce 함수
 *
 * 연속된 호출을 지연시켜 마지막 호출만 실행
 *
 * @param func - 실행할 함수
 * @param delay - 지연 시간 (ms)
 * @returns Debounced 함수
 *
 * @example
 * const debouncedSearch = debounce(searchFunc, 300)
 * debouncedSearch('query') // 300ms 후 실행
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * CSS 클래스명 병합
 *
 * @param classes - 클래스명 배열
 * @returns 병합된 클래스명 문자열
 *
 * @example
 * cn('text-lg', 'font-bold', undefined, 'text-blue-500')
 * // => 'text-lg font-bold text-blue-500'
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
