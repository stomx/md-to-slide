'use client'

import React from 'react'
import { FileDown, FileText, FileImage } from 'lucide-react'

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

  const handleExportPptx = async () => {
    try {
      const revealContainer = document.querySelector('.reveal') as HTMLElement
      if (!revealContainer) {
        showToast.error('슬라이드 프리뷰를 찾을 수 없습니다.')
        return
      }

      const { exportToPptx } = await import('@/lib/export/pptxExporter')
      await exportToPptx(revealContainer, {
        theme: selectedTheme,
        includeNotes: false,
      })
      showToast.success('PPTX 내보내기 완료!')
    } catch {
      showToast.error('PPTX 내보내기에 실패했습니다.')
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
      <Button onClick={handleExportPptx} variant="outline" size="sm">
        <FileImage className="mr-2 h-4 w-4" />
        Export PPTX
      </Button>
    </div>
  )
}
