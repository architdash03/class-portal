'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { formatDate } from '@/lib/utils/date'
import { parsePhotoLines } from '@/lib/memories/photoUrl'
import type { ClassMemory, MemoryPhoto } from '@/types/database'

type Draft = { title: string; description: string; event_date: string; links: string }

const emptyDraft: Draft = { title: '', description: '', event_date: '', links: '' }

function sortedPhotos(memory: ClassMemory): MemoryPhoto[] {
  return [...(memory.memory_photos || [])].sort((a, b) => a.sort_order - b.sort_order)
}

export default function MemoriesEditor({ classId, initialMemories }: { classId: string; initialMemories: ClassMemory[] }) {
  const [memories, setMemories] = useState<ClassMemory[]>(initialMemories)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [extraLinks, setExtraLinks] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function explain(error: { message: string; code?: string }) {
    if (error.code === '42P01' || error.message.includes('class_memories') || error.message.includes('memory_photos')) {
      return 'The memories tables are not in the database yet. Open the Supabase SQL Editor and run supabase/add-class-memories.sql, then refresh this page.'
    }
    return error.message
  }

  async function addMemory() {
    if (!draft.title.trim()) {
      setMessage('Write a title for this memory.')
      return
    }
    const { photos, rejected } = parsePhotoLines(draft.links)
    if (rejected.length > 0) {
      setMessage(`These lines are not photo links: ${rejected.slice(0, 3).join(' · ')}`)
      return
    }
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('class_memories')
      .insert({
        class_id: classId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        event_date: draft.event_date || null,
        sort_order: memories.length,
      })
      .select('*')
      .single()
    if (error || !data) {
      setSaving(false)
      setMessage(error ? explain(error) : 'Nothing was saved.')
      return
    }
    let savedPhotos: MemoryPhoto[] = []
    if (photos.length > 0) {
      const { data: photoRows, error: photoError } = await supabase
        .from('memory_photos')
        .insert(photos.map((photo, index) => ({
          memory_id: data.id,
          image_url: photo.url,
          caption: photo.caption,
          sort_order: index,
        })))
        .select('*')
      if (photoError) {
        setSaving(false)
        setMemories((prev) => [{ ...(data as ClassMemory), memory_photos: [] }, ...prev])
        setMessage(explain(photoError))
        return
      }
      savedPhotos = (photoRows || []) as MemoryPhoto[]
    }
    setSaving(false)
    setMemories((prev) => [{ ...(data as ClassMemory), memory_photos: savedPhotos }, ...prev])
    setDraft(emptyDraft)
    setMessage('Saved.')
  }

  async function saveDetails(memory: ClassMemory, next: { title: string; description: string; event_date: string }) {
    if (!next.title.trim()) {
      setMessage('The title cannot be empty.')
      return
    }
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('class_memories')
      .update({
        title: next.title.trim(),
        description: next.description.trim(),
        event_date: next.event_date || null,
      })
      .eq('id', memory.id)
      .select('*')
      .single()
    setSaving(false)
    if (error || !data) {
      setMessage(error ? explain(error) : 'Nothing was saved.')
      return
    }
    setMemories((prev) => prev.map((row) => (row.id === memory.id ? { ...row, ...(data as ClassMemory) } : row)))
    setMessage('Updated.')
  }

  async function addPhotos(memory: ClassMemory) {
    const { photos, rejected } = parsePhotoLines(extraLinks[memory.id] || '')
    if (photos.length === 0) {
      setMessage(rejected.length ? `These lines are not photo links: ${rejected[0]}` : 'Paste at least one photo link.')
      return
    }
    if (rejected.length > 0) {
      setMessage(`These lines are not photo links: ${rejected.slice(0, 3).join(' · ')}`)
      return
    }
    const start = sortedPhotos(memory).length
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('memory_photos')
      .insert(photos.map((photo, index) => ({
        memory_id: memory.id,
        image_url: photo.url,
        caption: photo.caption,
        sort_order: start + index,
      })))
      .select('*')
    setSaving(false)
    if (error || !data) {
      setMessage(error ? explain(error) : 'Photos were not saved.')
      return
    }
    setMemories((prev) => prev.map((row) => (
      row.id === memory.id
        ? { ...row, memory_photos: [...(row.memory_photos || []), ...(data as MemoryPhoto[])] }
        : row
    )))
    setExtraLinks((prev) => ({ ...prev, [memory.id]: '' }))
    setMessage('Photos added.')
  }

  async function removePhoto(memoryId: string, photoId: string) {
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.from('memory_photos').delete().eq('id', photoId)
    setSaving(false)
    if (error) {
      setMessage(explain(error))
      return
    }
    setMemories((prev) => prev.map((row) => (
      row.id === memoryId
        ? { ...row, memory_photos: (row.memory_photos || []).filter((photo) => photo.id !== photoId) }
        : row
    )))
  }

  async function removeMemory(id: string) {
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.from('class_memories').delete().eq('id', id)
    setSaving(false)
    if (error) {
      setMessage(explain(error))
      return
    }
    setMemories((prev) => prev.filter((row) => row.id !== id))
    setMessage('Removed.')
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rainbow-ring p-5 space-y-3">
        <h2 className="text-sm font-semibold text-purple-950">Add a memory</h2>
        <p className="text-xs text-purple-700">
          Photos can wait. When you have one, upload it, copy the link, and paste it below. One link per line.
        </p>
        <Input
          placeholder="Title, for example Freshers day"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <Input
          type="date"
          value={draft.event_date}
          onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
        />
        <Textarea
          placeholder="What happened, who was there, or anything the class should remember"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <Textarea
          placeholder="Paste a photo link, one per line"
          value={draft.links}
          onChange={(e) => setDraft({ ...draft, links: e.target.value })}
          rows={6}
        />
        {message && <p className="text-sm text-purple-800">{message}</p>}
        <Button onClick={addMemory} disabled={saving}>{saving ? 'Saving...' : 'Save memory'}</Button>
      </div>

      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          extra={extraLinks[memory.id] || ''}
          saving={saving}
          onExtraChange={(value) => setExtraLinks((prev) => ({ ...prev, [memory.id]: value }))}
          onSaveDetails={(next) => saveDetails(memory, next)}
          onAddPhotos={() => addPhotos(memory)}
          onRemovePhoto={(photoId) => removePhoto(memory.id, photoId)}
          onRemove={() => removeMemory(memory.id)}
        />
      ))}
    </div>
  )
}

function MemoryCard({
  memory,
  extra,
  saving,
  onExtraChange,
  onSaveDetails,
  onAddPhotos,
  onRemovePhoto,
  onRemove,
}: {
  memory: ClassMemory
  extra: string
  saving: boolean
  onExtraChange: (value: string) => void
  onSaveDetails: (next: { title: string; description: string; event_date: string }) => void
  onAddPhotos: () => void
  onRemovePhoto: (photoId: string) => void
  onRemove: () => void
}) {
  const [title, setTitle] = useState(memory.title)
  const [description, setDescription] = useState(memory.description)
  const [eventDate, setEventDate] = useState(memory.event_date || '')
  const photos = sortedPhotos(memory)

  return (
    <article className="glass-card rainbow-ring p-5 space-y-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onSaveDetails({ title, description, event_date: eventDate })} disabled={saving}>Save details</Button>
        <Button size="sm" variant="danger" onClick={onRemove} disabled={saving}>Delete memory</Button>
        {memory.event_date && <span className="text-xs text-purple-500 self-center">Was {formatDate(memory.event_date)}</span>}
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((photo) => (
            <div key={photo.id}>
              <img src={photo.image_url} alt={photo.caption || memory.title} className="aspect-square w-full rounded-lg object-cover bg-purple-100" />
              <button type="button" className="text-[11px] text-rose-600 mt-1" onClick={() => onRemovePhoto(photo.id)} disabled={saving}>
                Remove photo
              </button>
            </div>
          ))}
        </div>
      )}
      <Textarea
        placeholder="Add more photo links, one per line"
        value={extra}
        onChange={(e) => onExtraChange(e.target.value)}
        rows={3}
      />
      <Button size="sm" variant="secondary" onClick={onAddPhotos} disabled={saving}>Add these photos</Button>
    </article>
  )
}
