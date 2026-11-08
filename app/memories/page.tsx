import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import MemoriesGallery from '@/components/memories/MemoriesGallery'
import type { ClassMemory } from '@/types/database'

export default async function MemoriesPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)
  const { data } = await supabase
    .from('class_memories')
    .select('*, memory_photos(*)')
    .eq('class_id', profile.class_id)
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const memories = ((data || []) as ClassMemory[]).map((memory) => ({
    ...memory,
    memory_photos: [...(memory.memory_photos || [])].sort((a, b) => a.sort_order - b.sort_order),
  }))

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Memories</h1>
      <p className="page-subtitle text-sm mb-4">Photos and stories from the class.</p>
      <MemoriesGallery memories={memories} />
    </AppShell>
  )
}
