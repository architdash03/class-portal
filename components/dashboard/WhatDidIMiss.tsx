'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils/date'
import type { Subject } from '@/types/database'

export default function WhatDidIMiss({
  classId,
  subjects,
  absentDates,
}: {
  classId: string
  subjects: Subject[]
  absentDates: string[]
}) {
  const [date, setDate] = useState(absentDates[0] || '')
  const [subjectId, setSubjectId] = useState('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    updates: any[]
    assignments: any[]
    homework: any[]
    announcements: any[]
  } | null>(null)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    const supabase = createClient()

    async function load() {
      const subjectFilter = subjectId !== 'all' ? { subject_id: subjectId } : {}

      const [updatesQ, assignmentsQ, homeworkQ, announcementsQ] = await Promise.all([
        supabase.from('class_updates').select('*, subjects(name)').eq('class_id', classId).eq('taught_date', date).match(subjectFilter),
        supabase.from('assignments').select('*, subjects(name)').eq('class_id', classId).eq('assigned_date', date).match(subjectFilter),
        supabase.from('homework').select('*, subjects(name)').eq('class_id', classId).eq('assigned_date', date).match(subjectFilter),
        supabase
          .from('announcements')
          .select('*')
          .eq('class_id', classId)
          .gte('created_at', `${date}T00:00:00`)
          .lte('created_at', `${date}T23:59:59`),
      ])

      setResults({
        updates: updatesQ.data || [],
        assignments: assignmentsQ.data || [],
        homework: homeworkQ.data || [],
        announcements: announcementsQ.data || [],
      })
      setLoading(false)
    }

    load()
  }, [date, subjectId, classId])

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {absentDates.length > 0 && (
        <div className="text-xs text-slate-500">
          You were marked absent on: {absentDates.slice(0, 8).map((d) => (
            <button key={d} onClick={() => setDate(d)} className="underline text-blue-600 mr-2">
              {formatDate(d)}
            </button>
          ))}
        </div>
      )}

      {!date ? (
        <EmptyState message="Pick a date to see what happened in class." />
      ) : loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">What was taught</h3>
            {results?.updates.length ? (
              <ul className="space-y-2">
                {results.updates.map((u) => (
                  <li key={u.id} className="text-sm text-slate-700">
                    <span className="font-medium">{u.subjects?.name}:</span> {u.topic} — {u.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Nothing recorded for this date.</p>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Assignments given</h3>
            {results?.assignments.length ? (
              <ul className="space-y-2">
                {results.assignments.map((a) => (
                  <li key={a.id} className="text-sm text-slate-700">{a.title} ({a.subjects?.name}) — due {formatDate(a.due_date)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">None.</p>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Homework given</h3>
            {results?.homework.length ? (
              <ul className="space-y-2">
                {results.homework.map((h) => (
                  <li key={h.id} className="text-sm text-slate-700">{h.title} ({h.subjects?.name}) — due {formatDate(h.due_date)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">None.</p>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Announcements that day</h3>
            {results?.announcements.length ? (
              <ul className="space-y-2">
                {results.announcements.map((a) => (
                  <li key={a.id} className="text-sm text-slate-700">{a.title} — {a.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">None.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
