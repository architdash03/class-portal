'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import BulkAddStudents from '@/components/admin/BulkAddStudents'
import type { Profile } from '@/types/database'

export default function StudentManager({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [filter, setFilter] = useState<'all' | 'student' | 'content_admin'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [showReset, setShowReset] = useState<Profile | null>(null)
  const [form, setForm] = useState({ studentId: '', fullName: '', password: '', role: 'student' as 'student' | 'content_admin' })
  const [resetPassword, setResetPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    setProfiles(data || [])
  }

  async function handleAdd() {
    if (!form.studentId || !form.fullName || !form.password) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Failed to create account.')
      return
    }
    setShowAdd(false)
    setForm({ studentId: '', fullName: '', password: '', role: 'student' })
    refresh()
  }

  async function handleToggleActive(profile: Profile) {
    const supabase = createClient()
    await supabase.from('profiles').update({ is_active: !profile.is_active }).eq('id', profile.id)
    setProfiles((prev) => prev.map((p) => (p.id === profile.id ? { ...p, is_active: !p.is_active } : p)))
  }

  async function handleReset() {
    if (!showReset || resetPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/reset-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId: showReset.auth_user_id, newPassword: resetPassword }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Failed to reset password.')
      return
    }
    setShowReset(null)
    setResetPassword('')
  }

  const filtered = profiles.filter((p) => filter === 'all' || p.role === filter).filter((p) => p.role !== 'head_admin')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {(['all', 'student', 'content_admin'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              {f === 'all' ? 'All' : f === 'student' ? 'Students' : 'Content Admins'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBulkAdd(true)}>Bulk-add</Button>
          <Button onClick={() => { setShowAdd(true); setError('') }}>+ Add account</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No accounts yet. Click + Add account to create one." />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium text-slate-900">{p.full_name}</p>
                <p className="text-xs text-slate-500">
                  {p.student_id} · {p.role === 'student' ? 'Student' : 'Content Admin'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={p.is_active ? 'success' : 'muted'}>{p.is_active ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant="secondary" onClick={() => { setShowReset(p); setError('') }}>Reset password</Button>
                <Button size="sm" variant={p.is_active ? 'danger' : 'secondary'} onClick={() => handleToggleActive(p)}>
                  {p.is_active ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add account" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
                <option value="student">Student</option>
                <option value="content_admin">Content Admin</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Student / Login ID</label>
              <Input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="e.g. CS2024001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Temporary password</label>
              <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Share this with the student" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowAdd(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleAdd} disabled={saving}>{saving ? 'Creating...' : 'Create account'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {showBulkAdd && (
        <BulkAddStudents onClose={() => setShowBulkAdd(false)} onDone={refresh} />
      )}

      {showReset && (
        <Modal title={`Reset password for ${showReset.full_name}`} onClose={() => setShowReset(null)}>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="New password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowReset(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleReset} disabled={saving}>{saving ? 'Saving...' : 'Reset password'}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
