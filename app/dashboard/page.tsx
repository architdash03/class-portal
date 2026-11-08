import { requireProfile } from '@/lib/auth/getProfile'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Badge, { priorityTone } from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import { dueLabel, examCountdown, formatDate } from '@/lib/utils/date'
import InfoTable from '@/components/information/InfoTable'
import type { Assignment, Homework, Exam, Announcement, ClassUpdate, ClassSettings, ClassInformation, ClassMemory } from '@/types/database'

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const today = new Date().toISOString().split('T')[0]

  const [{ data: settings }, { data: announcements }, { data: assignments }, { data: homework }, { data: exams }, { data: updates }, { data: myAssignmentStatus }, { data: myHomeworkStatus }, { data: information }, { data: memories }] =
    await Promise.all([
      supabase.from('class_settings').select('*').eq('class_id', profile.class_id).single(),
      supabase.from('announcements').select('*').eq('class_id', profile.class_id).order('created_at', { ascending: false }).limit(5),
      supabase.from('assignments').select('*, subjects(name)').eq('class_id', profile.class_id).gte('due_date', today).order('due_date', { ascending: true }).limit(5),
      supabase.from('homework').select('*, subjects(name)').eq('class_id', profile.class_id).gte('due_date', today).order('due_date', { ascending: true }).limit(5),
      supabase.from('exams').select('*, subjects(name)').eq('class_id', profile.class_id).gte('exam_date', today).order('exam_date', { ascending: true }).limit(5),
      supabase.from('class_updates').select('*, subjects(name)').eq('class_id', profile.class_id).order('taught_date', { ascending: false }).limit(5),
      supabase.from('assignment_status').select('assignment_id, status').eq('student_id', profile.id),
      supabase.from('homework_status').select('homework_id, status').eq('student_id', profile.id),
      supabase.from('class_information').select('*').eq('class_id', profile.class_id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('class_memories').select('id, title, event_date, memory_photos(image_url, sort_order)').eq('class_id', profile.class_id).order('event_date', { ascending: false, nullsFirst: false }).limit(3),
    ])

  const assignmentStatusMap = new Map((myAssignmentStatus || []).map((s) => [s.assignment_id, s.status]))
  const homeworkStatusMap = new Map((myHomeworkStatus || []).map((s) => [s.homework_id, s.status]))

  const deadlines = [
    ...(assignments || []).map((a: Assignment) => ({
      id: a.id,
      title: a.title,
      subject: a.subjects?.name || '—',
      due_date: a.due_date,
      type: 'Assignment',
      status: assignmentStatusMap.get(a.id) || 'pending',
    })),
    ...(homework || []).map((h: Homework) => ({
      id: h.id,
      title: h.title,
      subject: h.subjects?.name || '—',
      due_date: h.due_date,
      type: 'Homework',
      status: homeworkStatusMap.get(h.id) || 'pending',
    })),
  ]
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 6)

  const websiteName = (settings as ClassSettings | null)?.website_name || 'Class Portal'

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="page-subtitle text-sm">{formatDate(today)}</p>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-purple-950">Class information</h2>
            <Link href="/information" className="text-xs text-fuchsia-700 hover:underline">View all</Link>
          </div>
          <InfoTable rows={(information || []) as ClassInformation[]} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-purple-950">Memories</h2>
            <Link href="/memories" className="text-xs text-fuchsia-700 hover:underline">View all</Link>
          </div>
          {!memories || memories.length === 0 ? (
            <EmptyState message="No class memories yet." />
          ) : (
            <ul className="space-y-3">
              {(memories as ClassMemory[]).map((memory) => {
                const cover = [...(memory.memory_photos || [])].sort((a, b) => a.sort_order - b.sort_order)[0]
                return (
                  <li key={memory.id}>
                    <Link href="/memories" className="flex items-center gap-3 text-sm">
                      {cover ? (
                        <img src={cover.image_url} alt="" className="h-12 w-12 rounded-lg object-cover bg-purple-100" />
                      ) : (
                        <span className="h-12 w-12 rounded-lg bg-purple-100" />
                      )}
                      <span>
                        <span className="block font-medium text-slate-800">{memory.title}</span>
                        {memory.event_date && <span className="text-xs text-slate-500">{formatDate(memory.event_date)}</span>}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/memories', label: 'Memories' },
            { href: '/assignments', label: 'Assignments' },
            { href: '/homework', label: 'Homework' },
            { href: '/exams', label: 'Exam Calendar' },
            { href: '/attendance', label: 'Attendance' },
            { href: '/what-was-taught', label: 'What Was Taught' },
            { href: '/what-did-i-miss', label: 'What Did I Miss?' },
            ...(settings?.whatsapp_group_url ? [{ href: settings.whatsapp_group_url, label: 'WhatsApp Group', external: true }] : []),
            ...(settings?.whatsapp_channel_url ? [{ href: settings.whatsapp_channel_url, label: 'WhatsApp Channel', external: true }] : []),
          ].map((link: any) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              className="glass-card rainbow-ring px-3 py-3 text-sm font-medium text-purple-900 hover:brightness-105 text-center"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming deadlines */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Deadlines</h2>
              <Link href="/assignments" className="text-xs text-fuchsia-700 hover:underline">View all</Link>
            </div>
            {deadlines.length === 0 ? (
              <EmptyState message="No upcoming deadlines." />
            ) : (
              <ul className="space-y-3">
                {deadlines.map((d) => {
                  const info = dueLabel(d.due_date)
                  return (
                    <li key={`${d.type}-${d.id}`} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-800">{d.title}</p>
                        <p className="text-xs text-slate-500">{d.type} · {d.subject}</p>
                      </div>
                      <Badge tone={d.status === 'completed' ? 'success' : info.tone}>
                        {d.status === 'completed' ? 'Completed' : info.label}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Upcoming exams */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Exams</h2>
              <Link href="/exams" className="text-xs text-fuchsia-700 hover:underline">View all</Link>
            </div>
            {!exams || exams.length === 0 ? (
              <EmptyState message="No upcoming exams." />
            ) : (
              <ul className="space-y-3">
                {(exams as Exam[]).map((e) => {
                  const info = examCountdown(e.exam_date)
                  return (
                    <li key={e.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-800">{e.exam_name}</p>
                        <p className="text-xs text-slate-500">
                          {e.subjects?.name || '—'} · {formatDate(e.exam_date)}
                          {e.exam_time ? ` · ${e.exam_time}` : ''}
                          {e.venue ? ` · ${e.venue}` : ''}
                        </p>
                      </div>
                      <Badge tone={info.tone}>{info.label}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Recent announcements */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Recent Announcements</h2>
              <Link href="/announcements" className="text-xs text-fuchsia-700 hover:underline">View all</Link>
            </div>
            {!announcements || announcements.length === 0 ? (
              <EmptyState message="No announcements yet." />
            ) : (
              <ul className="space-y-3">
                {(announcements as Announcement[]).map((a) => (
                  <li key={a.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{a.title}</p>
                      <Badge tone={priorityTone(a.priority)}>{a.priority}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Recent class updates */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Recent Class Updates</h2>
              <Link href="/what-was-taught" className="text-xs text-fuchsia-700 hover:underline">View all</Link>
            </div>
            {!updates || updates.length === 0 ? (
              <EmptyState message="No class updates yet." />
            ) : (
              <ul className="space-y-3">
                {(updates as ClassUpdate[]).map((u) => (
                  <li key={u.id} className="text-sm">
                    <p className="font-medium text-slate-800">{u.topic}</p>
                    <p className="text-xs text-slate-500">
                      {u.subjects?.name || '—'} · {formatDate(u.taught_date)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
