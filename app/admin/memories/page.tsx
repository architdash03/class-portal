import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import MemoriesEditor from '@/components/memories/MemoriesEditor'
import type { ClassMemory } from '@/types/database'

export default async function AdminMemoriesPage() {
  const { supabase, profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)
  const { data } = await supabase
    .from('class_memories')
    .select('*, memory_photos(*)')
    .eq('class_id', profile.class_id)
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Memories</h1>
      <p className="page-subtitle text-sm mb-4">
        Add a title and the story. When you have photos, paste each photo link in the box, one per line.
      </p>
      <MemoriesEditor classId={profile.class_id!} initialMemories={(data || []) as ClassMemory[]} />
    </AdminShell>
  )
}
