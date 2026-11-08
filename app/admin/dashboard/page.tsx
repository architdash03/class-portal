import Link from 'next/link'
import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import Card from '@/components/ui/Card'
import Badge, { priorityTone } from '@/components/ui/Badge'
import InfoEditor from '@/components/information/InfoEditor'
import { formatDate } from '@/lib/utils/date'
import type { ClassInformation } from '@/types/database'

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalStudents },
    { count: totalAssignments },
    { count: upcomingExams },
    { data: recentAnnouncements },
    { data: recentUpdates },
    { data: recentNotifications },
    { count: presentToday },
    { count: absentToday },
    { data: information },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('class_id', profile.class_id).eq('role', 'student'),
    supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('class_id', profile.class_id),
    supabase.from('exams').select('id', { count: 'exact', head: true }).eq('class_id', profile.class_id).gte('exam_date', today),
    supabase.from('announcements').select('*').eq('class_id', profile.class_id).order('created_at', { ascending: false }).limit(5),
    supabase.from('class_updates').select('*, subjects(name)').eq('class_id', profile.class_id).order('taught_date', { ascending: false }).limit(5),
    supabase.from('notifications').select('*').eq('class_id', profile.class_id).order('created_at', { ascending: false }).limit(5),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('class_id', profile.class_id).eq('attendance_date', today).eq('status', 'present'),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('class_id', profile.class_id).eq('attendance_date', today).eq('status', 'absent'),
    supabase.from('class_information').select('*').eq('class_id', profile.class_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
  ])

  const stats = [
    { label: 'Total students', value: totalStudents || 0 },
    { label: 'Total assignments', value: totalAssignments || 0 },
    { label: 'Upcoming exams', value: upcomingExams || 0 },
    { label: 'Present today', value: presentToday || 0 },
    { label: 'Absent today', value: absentToday || 0 },
  ]

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <p className="page-subtitle text-sm">Use the purple buttons across the top to add announcements, homework, and exams.</p>
        </div>
        <Link href="/admin/information" className="text-sm text-white underline underline-offset-4">Edit information</Link>
      </div>

      <div className="mb-6">
        <InfoEditor classId={profile.class_id!} initialRows={(information || []) as ClassInformation[]} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Announcements</h2>
          {!recentAnnouncements || recentAnnouncements.length === 0 ? (
            <p className="text-sm text-slate-400">None yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentAnnouncements.map((a) => (
                <li key={a.id} className="text-sm flex items-center justify-between gap-2">
                  <span className="text-slate-700 truncate">{a.title}</span>
                  <Badge tone={priorityTone(a.priority)}>{a.priority}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Class Updates</h2>
          {!recentUpdates || recentUpdates.length === 0 ? (
            <p className="text-sm text-slate-400">None yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentUpdates.map((u) => (
                <li key={u.id} className="text-sm text-slate-700">
                  {u.topic} <span className="text-xs text-slate-400">· {formatDate(u.taught_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Notifications Sent</h2>
          {!recentNotifications || recentNotifications.length === 0 ? (
            <p className="text-sm text-slate-400">None yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentNotifications.map((n) => (
                <li key={n.id} className="text-sm text-slate-700">{n.title}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminShell>
  )
}
