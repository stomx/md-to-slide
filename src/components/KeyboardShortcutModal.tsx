// components/KeyboardShortcutModal.tsx

'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Cmd', 'S'],
    description: 'Save markdown to local storage',
    category: 'General',
  },
  {
    keys: ['Cmd', 'E'],
    description: 'Export to PDF',
    category: 'Export',
  },
  {
    keys: ['Cmd', 'Shift', 'E'],
    description: 'Export to HTML',
    category: 'Export',
  },
  {
    keys: ['Cmd', 'K'],
    description: 'Show keyboard shortcuts',
    category: 'Help',
  },
  {
    keys: ['Cmd', '?'],
    description: 'Show help modal',
    category: 'Help',
  },
  {
    keys: ['Esc'],
    description: 'Close modal',
    category: 'General',
  },
  {
    keys: ['Tab'],
    description: 'Focus next element',
    category: 'Navigation',
  },
  {
    keys: ['Shift', 'Tab'],
    description: 'Focus previous element',
    category: 'Navigation',
  },
]

const categories = Array.from(new Set(shortcuts.map((s) => s.category)))

interface KeyboardShortcutModalProps {
  open: boolean
  onClose: () => void
}

export const KeyboardShortcutModal = ({
  open,
  onClose,
}: KeyboardShortcutModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and control the app efficiently.
            Replace Cmd with Ctrl on Windows/Linux.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-600">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
