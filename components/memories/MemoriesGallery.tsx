'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils/date'
import type { ClassMemory, MemoryPhoto } from '@/types/database'

function sortedPhotos(memory: ClassMemory): MemoryPhoto[] {
  return [...(memory.memory_photos || [])].sort((a, b) => a.sort_order - b.sort_order)
}

export default function MemoriesGallery({ memories }: { memories: ClassMemory[] }) {
  const [open, setOpen] = useState<{ photos: MemoryPhoto[]; index: number; title: string } | null>(null)

  if (memories.length === 0) {
    return <p className="text-sm text-purple-400">No class memories have been added yet.</p>
  }

  const current = open ? open.photos[open.index] : null

  return (
    <div className="space-y-6">
      {memories.map((memory) => {
        const photos = sortedPhotos(memory)
        return (
          <article key={memory.id} className="glass-card rainbow-ring p-5">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-purple-950">{memory.title}</h2>
              {memory.event_date && (
                <p className="text-xs text-fuchsia-700 mt-0.5">{formatDate(memory.event_date)}</p>
              )}
              {memory.description && (
                <p className="text-sm text-purple-900/80 whitespace-pre-wrap mt-2">{memory.description}</p>
              )}
            </div>
            {photos.length === 0 ? (
              <p className="text-sm text-purple-400">No photos on this memory yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setOpen({ photos, index, title: memory.title })}
                    className="text-left"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption || memory.title}
                      className="aspect-square w-full rounded-xl object-cover bg-purple-100"
                    />
                    {photo.caption && (
                      <p className="text-[11px] text-purple-700 mt-1 line-clamp-2">{photo.caption}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </article>
        )
      })}

      {open && current && (
        <div
          className="fixed inset-0 z-50 bg-purple-950/80 flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={current.image_url}
              alt={current.caption || open.title}
              className="max-h-[75vh] w-full object-contain rounded-xl bg-black/20"
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-white">
              <p className="text-sm">
                {open.title}
                {current.caption ? ` · ${current.caption}` : ''}
                <span className="text-white/70"> ({open.index + 1} / {open.photos.length})</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-white/15 px-3 py-1 text-sm"
                  onClick={() => setOpen({ ...open, index: (open.index - 1 + open.photos.length) % open.photos.length })}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/15 px-3 py-1 text-sm"
                  onClick={() => setOpen({ ...open, index: (open.index + 1) % open.photos.length })}
                >
                  Next
                </button>
                <button type="button" className="rounded-full bg-white px-3 py-1 text-sm text-purple-900" onClick={() => setOpen(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
