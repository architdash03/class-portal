'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Badge, { priorityTone } from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils/date'
import type { Announcement } from '@/types/database'

interface Item extends Announcement {
  isRead: boolean
}

export default function AnnouncementList({ initialItems, studentId }: { initialItems: Item[]; studentId: string }) {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<'all' | 'normal' | 'important' | 'urgent'>('all')

  async function markRead(item: Item) {
    if (item.isRead) return
    const supabase = createClient()
    await supabase.from('announcement_reads').upsert(
      { announcement_id: item.id, student_id: studentId },
      { onConflict: 'announcement_id,student_id' }
    )
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)))
  }

  const filtered = items.filter((i) => filter === 'all' || i.priority === filter)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', 'normal', 'important', 'urgent'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No announcements here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 cursor-pointer ${!item.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
              onClick={() => markRead(item)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mb-1">{formatDate(item.created_at.split('T')[0])}</p>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
                <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
              </div>
              {!item.isRead && <p className="text-[11px] text-blue-600 mt-2">Tap to mark as read</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
