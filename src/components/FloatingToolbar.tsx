'use client'

/**
 * FloatingToolbar - 프리뷰 위 플로팅 스타일 도구
 *
 * hover 시에만 표시 (group-hover/canvas)
 */
export function FloatingToolbar() {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md shadow-sm border border-white/50 px-4 py-2 rounded-full flex items-center gap-4 transition-all opacity-0 group-hover/canvas:opacity-100">
      <ToolbarButton icon="grid_view" title="Layout" />
      <ToolbarDivider />
      <ToolbarButton icon="format_size" title="Text Style" />
      <ToolbarButton icon="palette" title="Colors" />
      <ToolbarDivider />
      <ToolbarButton icon="animation" title="Animation" />
    </div>
  )
}

function ToolbarButton({ icon, title }: { icon: string; title: string }) {
  return (
    <button
      className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
      title={title}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-gray-300" />
}
