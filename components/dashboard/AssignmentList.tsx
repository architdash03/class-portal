'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { dueLabel, formatDate } from '@/lib/utils/date'
import type { Assignment } from '@/types/database'

interface Item extends Assignment {
  myStatus: 'pending' | 'completed'
}

export default function AssignmentList({
  initialItems,
  studentId,
}: {
  initialItems: Item[]
  studentId: string
}) {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [savingId, setSavingId] = useState<string | null>(null)

  async function toggleComplete(item: Item) {
    setSavingId(item.id)
    const supabase = createClient()
    const newStatus = item.myStatus === 'completed' ? 'pending' : 'completed'

    await supabase.from('assignment_status').upsert(
      {
        assignment_id: item.id,
        student_id: studentId,
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      },
      { onConflict: 'assignment_id,student_id' }
    )

    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, myStatus: newStatus } : i)))
    setSavingId(null)
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = items.filter((i) => {
    if (filter === 'pending') return i.myStatus === 'pending' && i.due_date >= today
    if (filter === 'completed') return i.myStatus === 'completed'
    if (filter === 'overdue') return i.myStatus === 'pending' && i.due_date < today
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'completed', 'overdue'] as const).map((f) => (
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
        <EmptyState message="No assignments here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const info = dueLabel(item.due_date)
            const overdue = item.myStatus === 'pending' && item.due_date < today
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mb-1">
                      {item.subjects?.name || '—'} · Assigned {formatDate(item.assigned_date)} · Due {formatDate(item.due_date)}
                    </p>
                    {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                    {item.submission_instructions && (
                      <p className="text-xs text-slate-500 mt-1">Submission: {item.submission_instructions}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Badge tone={item.myStatus === 'completed' ? 'success' : overdue ? 'danger' : info.tone}>
                      {item.myStatus === 'completed' ? 'Completed' : overdue ? 'Overdue' : info.label}
                    </Badge>
                    <Button
                      size="sm"
                      variant={item.myStatus === 'completed' ? 'secondary' : 'primary'}
                      onClick={() => toggleComplete(item)}
                      disabled={savingId === item.id}
                    >
                      {item.myStatus === 'completed' ? 'Mark pending' : 'Mark complete'}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
