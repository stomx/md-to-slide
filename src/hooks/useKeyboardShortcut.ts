// hooks/useKeyboardShortcut.ts

'use client'

import { useEffect } from 'react'

export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: (e: KeyboardEvent) => void
  preventDefault?: boolean
  description?: string
}

export const useKeyboardShortcut = (
  shortcuts: ShortcutConfig[],
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const isShift = !shortcut.shift || e.shiftKey
        const isAlt = !shortcut.alt || e.altKey
        const isMeta = !shortcut.meta || e.metaKey
        const isKey = e.key.toLowerCase() === shortcut.key.toLowerCase()

        // Ctrl/Meta는 둘 중 하나만 체크
        const modifierMatch = shortcut.ctrl
          ? (e.ctrlKey || e.metaKey) && isShift && isAlt
          : isMeta && isShift && isAlt

        if (modifierMatch && isKey) {
          if (shortcut.preventDefault) {
            e.preventDefault()
          }
          shortcut.callback(e)
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

export const formatShortcut = (shortcut: ShortcutConfig): string => {
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  const parts: string[] = []

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push('Shift')
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Win')
  }

  parts.push(shortcut.key.toUpperCase())

  return parts.join(isMac ? '' : '+')
}
