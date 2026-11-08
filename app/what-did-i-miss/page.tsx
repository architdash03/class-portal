import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import WhatDidIMiss from '@/components/dashboard/WhatDidIMiss'

export default async function WhatDidIMissPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const [{ data: subjects }, { data: absences }] = await Promise.all([
    supabase.from('subjects').select('*').eq('class_id', profile.class_id).order('name'),
    supabase
      .from('attendance')
      .select('attendance_date')
      .eq('student_id', profile.id)
      .eq('status', 'absent')
      .order('attendance_date', { ascending: false }),
  ])

  const absentDates = Array.from(new Set((absences || []).map((a) => a.attendance_date)))

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">What Did I Miss?</h1>
      <p className="text-sm text-slate-500 mb-4">Pick a date to see what happened in class that day.</p>
      <WhatDidIMiss classId={profile.class_id!} subjects={subjects || []} absentDates={absentDates} />
    </AppShell>
  )
}
