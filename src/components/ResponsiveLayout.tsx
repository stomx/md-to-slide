// components/ResponsiveLayout.tsx

'use client'

import React from 'react'
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()

  const childrenArray = React.Children.toArray(children)
  const [editor, preview] = childrenArray

  // Mobile: Single column (Editor above, Preview below)
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="w-full">{editor}</div>
        <div className="w-full">{preview}</div>
      </div>
    )
  }

  // Tablet: Tabs
  if (isTablet) {
    return (
      <div className="p-4">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="editor" className="text-base">
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-base">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="mt-0">
            {editor}
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            {preview}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Desktop: 2-column layout (existing)
  return (
    <div className="grid grid-cols-2 gap-4 p-4 h-screen">
      <div className="overflow-auto">{editor}</div>
      <div className="overflow-auto">{preview}</div>
    </div>
  )
}
