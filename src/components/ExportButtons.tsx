'use client'

import React from 'react'
import { useSlideStore } from '@/store/slide-store'
import { Button } from './ui/button'
import { exportToPDF, exportToHTML } from '@/lib/exportHelper'
import type { ExportConfig } from '@/types/slide.types'
import { FileDown, FileText } from 'lucide-react'

/**
 * ExportButtons 컴포넌트
 *
 * PDF 및 HTML 내보내기 버튼
 */
export function ExportButtons() {
  const { selectedTheme } = useSlideStore()

  const handleExportPDF = () => {
    const config: ExportConfig = {
      format: 'pdf',
      includeNotes: false,
      theme: selectedTheme,
    }
    exportToPDF(config)
  }

  const handleExportHTML = () => {
    const config: ExportConfig = {
      format: 'html',
      includeNotes: false,
      theme: selectedTheme,
    }
    exportToHTML(config, 'presentation.html')
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportPDF} size="sm">
        <FileDown className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button onClick={handleExportHTML} variant="outline" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Export HTML
      </Button>
    </div>
  )
}
