import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { examCountdown, formatDate } from '@/lib/utils/date'
import type { Exam } from '@/types/database'

export default async function ExamsPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const { data: exams } = await supabase
    .from('exams')
    .select('*, subjects(name)')
    .eq('class_id', profile.class_id)
    .order('exam_date', { ascending: true })

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Exam Calendar</h1>
      {!exams || exams.length === 0 ? (
        <EmptyState message="No exams scheduled yet." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {(exams as Exam[]).map((e) => {
            const info = examCountdown(e.exam_date)
            return (
              <Card key={e.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-slate-900">{e.exam_name}</p>
                  <Badge tone={info.tone}>{info.label}</Badge>
                </div>
                <p className="text-sm text-slate-600">{e.subjects?.name || '—'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDate(e.exam_date)}
                  {e.exam_time ? ` · ${e.exam_time}` : ''}
                  {e.venue ? ` · ${e.venue}` : ''}
                </p>
                {e.description && <p className="text-sm text-slate-600 mt-2">{e.description}</p>}
              </Card>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
