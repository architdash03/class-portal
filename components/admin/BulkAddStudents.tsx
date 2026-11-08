'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface ResultRow {
  studentId: string
  fullName: string
  success: boolean
  error?: string
}

export default function BulkAddStudents({
  onClose,
  onDone,
}: {
  onClose: () => void
  onDone: () => void
}) {
  const [role, setRole] = useState<'student' | 'content_admin'>('student')
  const [sharedPassword, setSharedPassword] = useState('')
  const [raw, setRaw] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<ResultRow[] | null>(null)

  function parseRows() {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [fullName, studentId] = line.split(',').map((s) => s.trim())
        return { fullName, studentId }
      })
  }

  const parsed = parseRows()

  async function handleSubmit() {
    setError('')
    if (parsed.length === 0) {
      setError('Paste at least one row as: Full Name, Student ID')
      return
    }
    if (sharedPassword.length < 6) {
      setError('Shared password must be at least 6 characters.')
      return
    }

    setSaving(true)
    const res = await fetch('/api/admin/bulk-create-students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: parsed, sharedPassword, role }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      return
    }

    setResults(data.results)
    onDone()
  }

  return (
    <Modal title="Bulk-add accounts" onClose={onClose}>
      {!results ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Paste one student per line as <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">Full Name, Student ID</span>.
            Everyone gets the same temporary password below, and each account will be required
            to set their own new password the first time they log in.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Role for these accounts</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="student">Student</option>
              <option value="content_admin">Content Admin</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Shared temporary password</label>
            <Input
              type="text"
              value={sharedPassword}
              onChange={(e) => setSharedPassword(e.target.value)}
              placeholder="e.g. Welcome@2026"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Students ({parsed.length} row{parsed.length === 1 ? '' : 's'} detected)
            </label>
            <Textarea
              rows={8}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={'Aditi Kumar, CS2024001\nRahul Sharma, CS2024002\nPriya Nair, CS2024003'}
              className="font-mono text-xs"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Creating accounts...' : `Create ${parsed.length || ''} account${parsed.length === 1 ? '' : 's'}`}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            {results.filter((r) => r.success).length} of {results.length} accounts created successfully.
          </p>
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
            {results.map((r, i) => (
              <div key={i} className="px-3 py-2 text-sm flex items-center justify-between gap-2">
                <span className="text-slate-700 truncate">{r.fullName || '(no name)'} — {r.studentId || '(no ID)'}</span>
                {r.success ? (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">Created</span>
                ) : (
                  <span className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 shrink-0" title={r.error}>Failed</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Share the student ID list and the temporary password with your class (e.g. via WhatsApp).
            Each account will be asked to set its own password on first login.
          </p>
          <div className="flex justify-end pt-2">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
