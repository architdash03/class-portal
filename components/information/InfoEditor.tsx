'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import type { ClassInformation } from '@/types/database'

type Draft = { title: string; details: string }

export default function InfoEditor({ classId, initialRows }: { classId: string; initialRows: ClassInformation[] }) {
  const [rows, setRows] = useState<ClassInformation[]>(initialRows)
  const [draft, setDraft] = useState<Draft>({ title: '', details: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>({ title: '', details: '' })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function explain(error: { message: string; code?: string }) {
    if (error.code === '42P01' || error.message.includes('class_information')) {
      return 'The information table is not in the database yet. Open the Supabase SQL Editor and run the file supabase/add-class-information.sql, then refresh this page.'
    }
    return error.message
  }

  async function addRow() {
    if (!draft.title.trim() || !draft.details.trim()) {
      setMessage('Write both a topic and the information before saving.')
      return
    }
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('class_information')
      .insert({
        class_id: classId,
        title: draft.title.trim(),
        details: draft.details.trim(),
        sort_order: rows.length,
      })
      .select('*')
      .single()
    setSaving(false)
    if (error || !data) {
      setMessage(error ? explain(error) : 'Nothing was saved.')
      return
    }
    setRows((prev) => [...prev, data as ClassInformation])
    setDraft({ title: '', details: '' })
    setMessage('Saved.')
  }

  function startEdit(row: ClassInformation) {
    setEditingId(row.id)
    setEditDraft({ title: row.title, details: row.details })
    setMessage('')
  }

  async function saveEdit(id: string) {
    if (!editDraft.title.trim() || !editDraft.details.trim()) {
      setMessage('Topic and information cannot be empty.')
      return
    }
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('class_information')
      .update({ title: editDraft.title.trim(), details: editDraft.details.trim() })
      .eq('id', id)
      .select('*')
      .single()
    setSaving(false)
    if (error || !data) {
      setMessage(error ? explain(error) : 'Nothing was saved.')
      return
    }
    setRows((prev) => prev.map((row) => (row.id === id ? (data as ClassInformation) : row)))
    setEditingId(null)
    setMessage('Updated.')
  }

  async function removeRow(id: string) {
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.from('class_information').delete().eq('id', id)
    setSaving(false)
    if (error) {
      setMessage(explain(error))
      return
    }
    setRows((prev) => prev.filter((row) => row.id !== id))
    if (editingId === id) setEditingId(null)
    setMessage('Removed.')
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rainbow-ring overflow-x-auto">
        <table className="info-table">
          <thead>
            <tr>
              <th className="w-1/3">Topic</th>
              <th>Information</th>
              <th className="w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-purple-400">
                  Nothing here yet. Add the first row below.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                {editingId === row.id ? (
                  <>
                    <td>
                      <Input value={editDraft.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} />
                    </td>
                    <td>
                      <Textarea value={editDraft.details} onChange={(e) => setEditDraft({ ...editDraft, details: e.target.value })} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => saveEdit(row.id)} disabled={saving}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)} disabled={saving}>Cancel</Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="font-semibold">{row.title}</td>
                    <td className="whitespace-pre-wrap">{row.details}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => removeRow(row.id)} disabled={saving}>Delete</Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card rainbow-ring p-5 space-y-3">
        <h2 className="text-sm font-semibold text-purple-950">Add information</h2>
        <Input
          placeholder="Topic, for example Class timing"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <Textarea
          placeholder="Write the information students should see"
          value={draft.details}
          onChange={(e) => setDraft({ ...draft, details: e.target.value })}
        />
        {message && <p className="text-sm text-purple-800">{message}</p>}
        <Button onClick={addRow} disabled={saving}>{saving ? 'Saving...' : 'Add to table'}</Button>
      </div>
    </div>
  )
}
