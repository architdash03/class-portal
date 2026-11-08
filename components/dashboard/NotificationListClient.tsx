'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils/date'
import type { NotificationRow } from '@/types/database'

export default function NotificationListClient({ initialItems }: { initialItems: NotificationRow[] }) {
  const [items, setItems] = useState(initialItems)

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)))
  }

  async function markAllRead() {
    const supabase = createClient()
    const unreadIds = items.filter((i) => !i.is_read).map((i) => i.id)
    if (unreadIds.length === 0) return
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })))
  }

  const unreadCount = items.filter((i) => !i.is_read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{unreadCount} unread</p>
        <Button size="sm" variant="secondary" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card
              key={n.id}
              className={`p-4 cursor-pointer ${!n.is_read ? 'border-l-4 border-l-blue-500' : ''}`}
              onClick={() => markRead(n.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{n.title}</p>
                  <p className="text-sm text-slate-600">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(n.created_at.split('T')[0])}</p>
                </div>
                {!n.is_read && <Badge tone="default">New</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
