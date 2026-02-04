import type { Theme } from '@/types/slide.types'

/**
 * reveal.js 빌트인 테마 목록
 *
 * reveal.js v5.1.0 기본 제공 테마
 * CDN: https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/{name}.css
 */
export const BUILTIN_THEMES: Theme[] = [
  {
    name: 'black',
    displayName: 'Black',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/black.css',
  },
  {
    name: 'white',
    displayName: 'White',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/white.css',
  },
  {
    name: 'league',
    displayName: 'League',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/league.css',
  },
  {
    name: 'beige',
    displayName: 'Beige',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/beige.css',
  },
  {
    name: 'sky',
    displayName: 'Sky',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/sky.css',
  },
  {
    name: 'night',
    displayName: 'Night',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/night.css',
  },
  {
    name: 'serif',
    displayName: 'Serif',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/serif.css',
  },
  {
    name: 'simple',
    displayName: 'Simple',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/simple.css',
  },
  {
    name: 'solarized',
    displayName: 'Solarized',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/solarized.css',
  },
  {
    name: 'moon',
    displayName: 'Moon',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/moon.css',
  },
  {
    name: 'dracula',
    displayName: 'Dracula',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/dracula.css',
  },
  {
    name: 'blood',
    displayName: 'Blood',
    builtIn: true,
    cssUrl: '/reveal.js/dist/theme/blood.css',
  },
]

/**
 * 기본 테마
 */
export const DEFAULT_THEME = 'black'

/**
 * 테마 이름으로 테마 찾기
 */
export function getThemeByName(name: string): Theme | undefined {
  return BUILTIN_THEMES.find(theme => theme.name === name)
}
