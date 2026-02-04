// hooks/useFocusTrap.ts

'use client'

import { useEffect, useRef } from 'react'

export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Handle tab key
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Trigger close event that parent can listen to
        const closeEvent = new CustomEvent('closeFocusTrap')
        container.dispatchEvent(closeEvent)
      }
    }

    container.addEventListener('keydown', handleTab)
    container.addEventListener('keydown', handleEscape)

    // Focus first element on mount
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTab)
      container.removeEventListener('keydown', handleEscape)
    }
  }, [isActive])

  return containerRef
}
