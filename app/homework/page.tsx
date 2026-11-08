import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import HomeworkList from '@/components/dashboard/HomeworkList'

export default async function HomeworkPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const [{ data: homework }, { data: statuses }] = await Promise.all([
    supabase
      .from('homework')
      .select('*, subjects(name)')
      .eq('class_id', profile.class_id)
      .order('due_date', { ascending: true }),
    supabase.from('homework_status').select('homework_id, status').eq('student_id', profile.id),
  ])

  const statusMap = new Map((statuses || []).map((s) => [s.homework_id, s.status]))
  const items = (homework || []).map((h) => ({ ...h, myStatus: statusMap.get(h.id) || 'pending' }))

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Homework</h1>
      <HomeworkList initialItems={items as any} studentId={profile.id} />
    </AppShell>
  )
}
