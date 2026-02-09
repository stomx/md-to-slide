// components/ResponsiveLayout.tsx

'use client'

import React from 'react'
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const childrenArray = React.Children.toArray(children)
  const [editor, preview, aiPanel] = childrenArray

  // Mobile: Single column (Editor above, Preview below)
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="w-full">{editor}</div>
        <div className="w-full">{preview}</div>
        {aiPanel}
      </div>
    )
  }

  // Tablet: Tabs
  if (isTablet) {
    return (
      <div className="p-4">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className={`grid w-full mb-4 ${aiPanel ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="editor" className="text-base">
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-base">
              Preview
            </TabsTrigger>
            {aiPanel && (
              <TabsTrigger value="ai" className="text-base">
                AI
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="editor" className="mt-0">
            {editor}
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            {preview}
          </TabsContent>
          {aiPanel && (
            <TabsContent value="ai" className="mt-0">
              {aiPanel}
            </TabsContent>
          )}
        </Tabs>
      </div>
    )
  }

  // Desktop (>= 1024px): 좌우 분할
  // aiPanel이 있으면 3분할 (40% / 35% / 25%), 없으면 50:50
  if (aiPanel) {
    return (
      <div className="flex h-full">
        <div className="w-[40%] border-r border-gray-200 bg-white">{editor}</div>
        <div className="w-[35%] border-r border-gray-200">{preview}</div>
        <div className="w-[25%]">{aiPanel}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="w-1/2 border-r border-gray-200 bg-white">{editor}</div>
      <div className="w-1/2">{preview}</div>
    </div>
  )
}
