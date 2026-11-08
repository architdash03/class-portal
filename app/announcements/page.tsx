import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import AnnouncementList from '@/components/dashboard/AnnouncementList'

export default async function AnnouncementsPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const [{ data: announcements }, { data: reads }] = await Promise.all([
    supabase.from('announcements').select('*').eq('class_id', profile.class_id).order('created_at', { ascending: false }),
    supabase.from('announcement_reads').select('announcement_id').eq('student_id', profile.id),
  ])

  const readIds = new Set((reads || []).map((r) => r.announcement_id))
  const items = (announcements || []).map((a) => ({ ...a, isRead: readIds.has(a.id) }))

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Announcements</h1>
      <AnnouncementList initialItems={items as any} studentId={profile.id} />
    </AppShell>
  )
}
