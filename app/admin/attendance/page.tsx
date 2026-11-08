import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import AttendanceMarker from '@/components/admin/AttendanceMarker'

export default async function AdminAttendancePage() {
  const { supabase, profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)

  const [{ data: students }, { data: subjects }] = await Promise.all([
    supabase.from('profiles').select('*').eq('class_id', profile.class_id).eq('role', 'student').eq('is_active', true).order('full_name'),
    supabase.from('subjects').select('*').eq('class_id', profile.class_id).order('name'),
  ])

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Mark Attendance</h1>
      <AttendanceMarker
        classId={profile.class_id!}
        markedBy={profile.id}
        students={students || []}
        subjects={subjects || []}
      />
    </AdminShell>
  )
}
