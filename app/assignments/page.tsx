import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import AssignmentList from '@/components/dashboard/AssignmentList'

export default async function AssignmentsPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const [{ data: assignments }, { data: statuses }] = await Promise.all([
    supabase
      .from('assignments')
      .select('*, subjects(name)')
      .eq('class_id', profile.class_id)
      .order('due_date', { ascending: true }),
    supabase.from('assignment_status').select('assignment_id, status').eq('student_id', profile.id),
  ])

  const statusMap = new Map((statuses || []).map((s) => [s.assignment_id, s.status]))
  const items = (assignments || []).map((a) => ({ ...a, myStatus: statusMap.get(a.id) || 'pending' }))

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Assignments</h1>
      <AssignmentList initialItems={items as any} studentId={profile.id} />
    </AppShell>
  )
}
