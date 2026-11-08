'use client'

import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils/date'
import type { ClassUpdate, Subject } from '@/types/database'

export default function ClassUpdateTimeline({ initialItems, subjects }: { initialItems: ClassUpdate[]; subjects: Subject[] }) {
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)

  const filtered = useMemo(() => {
    return initialItems.filter((u) => {
      if (subjectFilter !== 'all' && u.subject_id !== subjectFilter) return false
      if (dateFilter && u.taught_date !== dateFilter) return false
      if (search && !u.topic.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [initialItems, subjectFilter, dateFilter, search])

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-2">
        <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <Input type="text" placeholder="Search topic..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No class updates match your filters." />
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, visibleCount).map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{u.topic}</p>
                  <p className="text-xs text-slate-500 mb-1">
                    {u.subjects?.name || '—'} · {formatDate(u.taught_date)}
                    {u.teacher_name ? ` · ${u.teacher_name}` : ''}
                  </p>
                  {u.description && <p className="text-sm text-slate-600">{u.description}</p>}
                </div>
              </div>
            </Card>
          ))}
          {visibleCount < filtered.length && (
            <button
              onClick={() => setVisibleCount((v) => v + 10)}
              className="text-sm text-blue-600 hover:underline"
            >
              Load older updates
            </button>
          )}
        </div>
      )}
    </div>
  )
}
