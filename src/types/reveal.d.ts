declare module 'reveal.js' {
  interface RevealPlugin {
    id?: string
    init?: (reveal: Reveal) => void | Promise<void>
    destroy?: () => void
  }

  interface RevealOptions {
    embedded?: boolean
    controls?: boolean
    progress?: boolean
    center?: boolean
    transition?: string
    slideNumber?: boolean
    width?: number
    height?: number
    hash?: boolean
    plugins?: RevealPlugin[]
    markdown?: {
      separator?: string
      verticalSeparator?: string
      notesSeparator?: string
    }
  }

  class Reveal {
    constructor(element: HTMLElement, options?: RevealOptions)
    initialize(): Promise<void>
    sync(): void
    slide(h: number, v?: number, f?: number): void
    destroy(): void
    on(event: string, callback: () => void): void
  }

  export default Reveal
}

declare module 'reveal.js/plugin/markdown/markdown.esm.js' {
  import type { RevealPlugin } from 'reveal.js'
  const RevealMarkdown: RevealPlugin
  export default RevealMarkdown
}
