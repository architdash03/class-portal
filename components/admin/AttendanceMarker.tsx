'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import type { AttendanceStatus, Profile, Subject } from '@/types/database'

export default function AttendanceMarker({
  classId,
  markedBy,
  students,
  subjects,
}: {
  classId: string
  markedBy: string
  students: Profile[]
  subjects: Subject[]
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!subjectId || !date) return
    setLoading(true)
    setMessage('')
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('attendance_date', date)

      const map: Record<string, AttendanceStatus> = {}
      students.forEach((s) => {
        map[s.id] = 'present'
      })
      ;(data || []).forEach((row) => {
        map[row.student_id] = row.status
      })
      setStatuses(map)
      setLoading(false)
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, date])

  async function handleSave() {
    if (!subjectId) {
      setMessage('Please select a subject first.')
      return
    }
    setSaving(true)
    setMessage('')
    const supabase = createClient()

    const rows = students.map((s) => ({
      class_id: classId,
      subject_id: subjectId,
      student_id: s.id,
      attendance_date: date,
      status: statuses[s.id] || 'present',
      marked_by: markedBy,
    }))

    const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'student_id,subject_id,attendance_date' })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Attendance saved.')
  }

  function markAll(status: AttendanceStatus) {
    const map: Record<string, AttendanceStatus> = {}
    students.forEach((s) => (map[s.id] = status))
    setStatuses(map)
  }

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
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {subjects.length === 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Add a subject first (Subjects page) before marking attendance.
        </p>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => markAll('present')}>Mark all present</Button>
        <Button size="sm" variant="secondary" onClick={() => markAll('absent')}>Mark all absent</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <Card key={s.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{s.full_name}</p>
                <p className="text-xs text-slate-500">{s.student_id}</p>
              </div>
              <div className="flex gap-1">
                {(['present', 'absent', 'leave'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: status }))}
                    className={`text-xs px-2.5 py-1.5 rounded-md border capitalize ${
                      statuses[s.id] === status
                        ? status === 'present'
                          ? 'bg-green-600 text-white border-green-600'
                          : status === 'absent'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <Button onClick={handleSave} disabled={saving || subjects.length === 0}>
        {saving ? 'Saving...' : 'Save attendance'}
      </Button>
    </div>
  )
}
