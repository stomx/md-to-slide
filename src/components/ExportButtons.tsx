'use client'

import React from 'react'
import { FileDown, FileText } from 'lucide-react'

import { useSlideStore } from '@/store/slide-store'
import { exportToPDF, exportToHTML } from '@/lib/exportHelper'

import type { ExportConfig } from '@/types/slide.types'

import { Button } from './ui/Button'
import { showToast } from './Toast'

/**
 * ExportButtons 컴포넌트
 *
 * PDF 및 HTML 내보내기 버튼
 */
export function ExportButtons() {
  const { selectedTheme } = useSlideStore()

  const handleExportPDF = () => {
    try {
      const config: ExportConfig = {
        format: 'pdf',
        includeNotes: false,
        theme: selectedTheme,
      }
      exportToPDF(config)
    } catch {
      showToast.error('PDF 내보내기에 실패했습니다.')
    }
  }

  const handleExportHTML = () => {
    try {
      const config: ExportConfig = {
        format: 'html',
        includeNotes: false,
        theme: selectedTheme,
      }
      exportToHTML(config, 'presentation.html')
    } catch {
      showToast.error('HTML 내보내기에 실패했습니다.')
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportPDF} variant="outline" size="sm">
        <FileDown className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button onClick={handleExportHTML} variant="default" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Export HTML
      </Button>
    </div>
  )
}
