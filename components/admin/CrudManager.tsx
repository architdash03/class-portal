'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import Badge, { priorityTone } from '@/components/ui/Badge'
import type { Subject } from '@/types/database'

export type FieldType = 'text' | 'textarea' | 'date' | 'time' | 'select' | 'subject' | 'priority'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
  showInList?: boolean
}

export default function CrudManager({
  table,
  classId,
  createdBy,
  fields,
  subjects,
  titleField,
  subtitleFormatter,
  emptyMessage,
  extraDefaults,
  trackCreator = true,
}: {
  table: string
  classId: string
  createdBy: string
  fields: FieldConfig[]
  subjects?: Subject[]
  titleField: string
  subtitleFormatter?: (item: any) => string
  emptyMessage: string
  extraDefaults?: Record<string, any>
  trackCreator?: boolean
}) {
  const [items, setItems] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [formState, setFormState] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadItems() {
    const supabase = createClient()
    let query = supabase.from(table).select(subjects ? '*, subjects(name)' : '*').eq('class_id', classId)
    const { data } = await query.order('created_at', { ascending: false })
    setItems(data || [])
    setLoaded(true)
  }

  // Load once on mount
  if (!loaded) {
    loadItems()
  }

  function openCreate() {
    const defaults: Record<string, any> = {}
    fields.forEach((f) => {
      defaults[f.name] = f.type === 'priority' ? 'normal' : ''
    })
    setFormState(defaults)
    setEditing(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(item: any) {
    const defaults: Record<string, any> = {}
    fields.forEach((f) => {
      defaults[f.name] = item[f.name] ?? ''
    })
    setFormState(defaults)
    setEditing(item)
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    for (const f of fields) {
      if (f.required && !formState[f.name]) {
        setError(`${f.label} is required.`)
        return
      }
    }
    setSaving(true)
    setError('')
    const supabase = createClient()

    const payload: Record<string, any> = { ...formState, class_id: classId, ...extraDefaults }
    // Empty strings are rejected by date columns and optional foreign keys.
    for (const f of fields) {
      if ((f.type === 'date' || f.type === 'subject') && payload[f.name] === '') payload[f.name] = null
    }
    if ('subject_id' in payload && payload.subject_id === '') payload.subject_id = null

    let result
    if (editing) {
      result = await supabase.from(table).update(payload).eq('id', editing.id).select('id')
    } else {
      if (trackCreator) payload.created_by = createdBy
      result = await supabase.from(table).insert(payload).select('id')
    }

    setSaving(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (!result.data || result.data.length === 0) {
      setError('Nothing was saved. Your account may not have permission to change this, or the database rejected the row.')
      return
    }
    setShowForm(false)
    setLoaded(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from(table).delete().eq('id', deleteId)
    setDeleting(false)
    setDeleteId(null)
    setLoaded(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>+ Add</Button>
      </div>

      {loaded && items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900">{item[titleField]}</p>
                    {item.priority && <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>}
                  </div>
                  {subtitleFormatter && <p className="text-xs text-slate-500 mt-0.5">{subtitleFormatter(item)}</p>}
                  {item.description && <p className="text-sm text-slate-600 mt-1">{item.description}</p>}
                </div>
                <div className="shrink-0 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteId(item.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit' : 'Add new'} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {f.label}{f.required ? ' *' : ''}
                </label>
                {f.type === 'textarea' && (
                  <Textarea
                    value={formState[f.name] || ''}
                    onChange={(e) => setFormState({ ...formState, [f.name]: e.target.value })}
                  />
                )}
                {f.type === 'text' && (
                  <Input
                    type="text"
                    value={formState[f.name] || ''}
                    onChange={(e) => setFormState({ ...formState, [f.name]: e.target.value })}
                  />
                )}
                {f.type === 'date' && (
                  <Input
                    type="date"
                    value={formState[f.name] || ''}
                    onChange={(e) => setFormState({ ...formState, [f.name]: e.target.value })}
                  />
                )}
                {f.type === 'time' && (
                  <Input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={formState[f.name] || ''}
                    onChange={(e) => setFormState({ ...formState, [f.name]: e.target.value })}
                  />
                )}
                {f.type === 'priority' && (
                  <Select
                    value={formState[f.name] || 'normal'}
                    onChange={(e) => setFormState({ ...formState, [f.name]: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                )}
                {f.type === 'select' && (
                  <Select
                    value={formState[f.name] || ''}
                    onChange={(e) => setFormState({ ...formState, [f.name]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                )}
                {f.type === 'subject' && (
                  <Select
                    value={formState[f.name] || ''}
                    onChange={(e) => setFormState({ ...formState, [f.name]: e.target.value })}
                  >
                    <option value="">No subject</option>
                    {subjects?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                )}
              </div>
            ))}

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this item?"
          message="This cannot be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}
