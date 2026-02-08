'use client'

import React from 'react'

import { useSlideStore } from '@/store/slide-store'
import { BUILTIN_THEMES } from '@/constants/themes'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select'

/**
 * ThemeSelector 컴포넌트
 *
 * reveal.js 테마 선택 드롭다운
 */
export function ThemeSelector() {
  const { selectedTheme, setSelectedTheme } = useSlideStore()

  // 테마 변경 핸들러 (iframe이 자동으로 postMessage를 통해 테마 적용)
  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="theme-selector" className="text-sm font-medium text-gray-700">
        Theme
      </label>
      <Select value={selectedTheme} onValueChange={handleThemeChange}>
        <SelectTrigger id="theme-selector" className="w-48 bg-white">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {BUILTIN_THEMES.map((theme) => (
            <SelectItem key={theme.name} value={theme.name} className="text-gray-900">
              {theme.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
