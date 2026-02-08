// hooks/useMediaQuery.ts

'use client'

import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Initial check
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // Listen for changes
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Preset breakpoint hooks
// Mobile: < 640px, Tablet: 640px ~ 1023px, Desktop: >= 1024px
export const useIsMobile = () => useMediaQuery('(max-width: 639px)')
export const useIsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
