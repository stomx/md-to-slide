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

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="theme-selector" className="text-sm font-medium text-gray-400">
        Theme
      </label>
      <Select value={selectedTheme} onValueChange={handleThemeChange}>
        <SelectTrigger id="theme-selector" className="w-full bg-gray-700 text-gray-200 border-gray-600">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {BUILTIN_THEMES.map((theme) => (
            <SelectItem key={theme.name} value={theme.name} className="text-gray-200 focus:bg-gray-700 focus:text-white">
              {theme.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
