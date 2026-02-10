'use client'

export function EditorActionBar() {
  return (
    <div className="p-4 border-t border-gray-800 bg-sidebar-darker flex items-center justify-between gap-3">
      <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-700">
        <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
        Add Media
      </button>
      <button
        className="flex items-center justify-center p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
        title="Slide Settings"
      >
        <span className="material-symbols-outlined text-[20px]">tune</span>
      </button>
    </div>
  )
}
