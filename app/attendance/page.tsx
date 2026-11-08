import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils/date'

export default async function AttendancePage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const { data: records } = await supabase
    .from('attendance')
    .select('*, subjects(name)')
    .eq('student_id', profile.id)
    .order('attendance_date', { ascending: false })

  const total = records?.length || 0
  const present = records?.filter((r) => r.status === 'present').length || 0
  const absent = records?.filter((r) => r.status === 'absent').length || 0
  const leave = records?.filter((r) => r.status === 'leave').length || 0
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Attendance</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500 mt-1">Total classes</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-green-600">{present}</p>
          <p className="text-xs text-slate-500 mt-1">Attended</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-red-600">{absent}</p>
          <p className="text-xs text-slate-500 mt-1">Missed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-blue-600">{percentage}%</p>
          <p className="text-xs text-slate-500 mt-1">Attendance</p>
        </Card>
      </div>

      <h2 className="text-sm font-semibold text-slate-900 mb-2">History</h2>
      {!records || records.length === 0 ? (
        <EmptyState message="No attendance records yet." />
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-md px-4 py-2.5 text-sm">
              <span>{formatDate(r.attendance_date)} · {r.subjects?.name || '—'}</span>
              <Badge tone={r.status === 'present' ? 'success' : r.status === 'leave' ? 'warning' : 'danger'}>
                {r.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
