declare module 'reveal.js' {
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
