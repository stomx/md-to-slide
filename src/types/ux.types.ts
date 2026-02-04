// types/ux.types.ts - UX Type Definitions

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  message: string
  type: ToastType
  duration?: number  // ms (기본 3000)
  action?: {
    label: string
    onClick: () => void
  }
}

export interface KeyboardShortcut {
  key: string                       // 'S', 'E', 'K', '?'
  modifiers: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  }
  description: string               // "Save markdown"
  action: () => void
  context?: 'global' | 'editor' | 'preview'
}

export interface OnboardingStep {
  target: string                    // CSS selector
  content: string                   // 설명 텍스트
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disableBeacon?: boolean
}

export interface ResponsiveBreakpoint {
  name: 'mobile' | 'tablet' | 'desktop'
  minWidth: number
  maxWidth: number
  layout: 'single-column' | 'tabs' | 'two-column'
}

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number  // 0-100
}

export interface ErrorState {
  message: string
  lineNumber?: number
  recoverable?: boolean
}
