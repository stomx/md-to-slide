// components/HelpModal.tsx

'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export const HelpModal = ({ open, onClose }: HelpModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Markdown to Slide - Help Guide</DialogTitle>
          <DialogDescription>
            Learn how to create beautiful presentations with markdown syntax
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slide Separators */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Slide Separators</h3>
            <div className="space-y-2 text-sm">
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">---</code>
                <span className="ml-2 text-gray-600">
                  Horizontal slide (move right)
                </span>
              </div>
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">-----</code>
                <span className="ml-2 text-gray-600">
                  Vertical slide (move down)
                </span>
              </div>
            </div>
          </section>

          {/* Markdown Syntax */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Markdown Syntax</h3>
            <div className="space-y-2 text-sm">
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded"># Heading 1</code>
                <span className="ml-2 text-gray-600">Large heading</span>
              </div>
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">## Heading 2</code>
                <span className="ml-2 text-gray-600">Medium heading</span>
              </div>
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">**bold**</code>
                <span className="ml-2 text-gray-600">Bold text</span>
              </div>
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">*italic*</code>
                <span className="ml-2 text-gray-600">Italic text</span>
              </div>
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">`code`</code>
                <span className="ml-2 text-gray-600">Inline code</span>
              </div>
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">- Item</code>
                <span className="ml-2 text-gray-600">Bullet list</span>
              </div>
              <div>
                <code className="px-2 py-1 bg-gray-100 rounded">1. Item</code>
                <span className="ml-2 text-gray-600">Numbered list</span>
              </div>
            </div>
          </section>

          {/* Example */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Example</h3>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded text-sm overflow-x-auto">
{`# Welcome Slide
This is the first slide

---

## Second Slide
- Point 1
- Point 2
- Point 3

---

## Code Example
\`\`\`javascript
function hello() {
  console.log("Hello World!")
}
\`\`\`

-----

### Vertical Slide
This slide appears below the previous one`}
            </pre>
          </section>

          {/* Themes */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Themes</h3>
            <p className="text-sm text-gray-600">
              Choose from 12 reveal.js themes using the theme selector:
              black, white, league, beige, night, serif, simple, solarized,
              moon, dracula, sky, blood
            </p>
          </section>

          {/* Export */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Export</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <strong>PDF</strong>: Use browser print (Cmd+P) with "Save as PDF"
              </p>
              <p className="text-gray-600">
                <strong>HTML</strong>: Standalone file with reveal.js bundled
              </p>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Use keyboard shortcuts for faster workflow (Cmd+K to view)</li>
              <li>Markdown updates in real-time (300ms debounce)</li>
              <li>Save your work locally with Cmd+S</li>
              <li>Press Esc to exit fullscreen mode in preview</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
