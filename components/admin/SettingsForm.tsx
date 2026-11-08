'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import type { ClassSettings } from '@/types/database'

export default function SettingsForm({ initialSettings, classId }: { initialSettings: ClassSettings | null; classId: string }) {
  const [form, setForm] = useState({
    website_name: initialSettings?.website_name || 'Class Portal',
    class_description: initialSettings?.class_description || '',
    whatsapp_group_url: initialSettings?.whatsapp_group_url || '',
    whatsapp_channel_url: initialSettings?.whatsapp_channel_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    setMessage('')
    const supabase = createClient()

    const { error } = await supabase
      .from('class_settings')
      .upsert({ class_id: classId, ...form }, { onConflict: 'class_id' })

    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Settings saved.')
  }

  return (
    <div className="glass-card rainbow-ring space-y-4 max-w-lg p-6">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Website name</label>
        <Input value={form.website_name} onChange={(e) => setForm({ ...form, website_name: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Class description</label>
        <Textarea value={form.class_description} onChange={(e) => setForm({ ...form, class_description: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">WhatsApp group link</label>
        <Input
          type="url"
          placeholder="https://chat.whatsapp.com/..."
          value={form.whatsapp_group_url}
          onChange={(e) => setForm({ ...form, whatsapp_group_url: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">WhatsApp channel link</label>
        <Input
          type="url"
          placeholder="https://whatsapp.com/channel/..."
          value={form.whatsapp_channel_url}
          onChange={(e) => setForm({ ...form, whatsapp_channel_url: e.target.value })}
        />
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</Button>
    </div>
  )
}
