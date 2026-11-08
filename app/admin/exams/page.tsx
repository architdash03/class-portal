import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import CrudManager from '@/components/admin/CrudManager'
import { formatDate } from '@/lib/utils/date'

export default async function AdminExamsPage() {
  const { supabase, profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)
  const { data: subjects } = await supabase.from('subjects').select('*').eq('class_id', profile.class_id).order('name')

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Exams</h1>
      <CrudManager
        table="exams"
        classId={profile.class_id!}
        createdBy={profile.id}
        subjects={subjects || []}
        titleField="exam_name"
        emptyMessage="No exams yet. Click + Add to create one."
        subtitleFormatter={(item) => `${item.subjects?.name || 'No subject'} · ${formatDate(item.exam_date)}${item.venue ? ' · ' + item.venue : ''}`}
        fields={[
          { name: 'exam_name', label: 'Exam name', type: 'text', required: true },
          { name: 'subject_id', label: 'Subject', type: 'subject' },
          { name: 'exam_date', label: 'Exam date', type: 'date', required: true },
          { name: 'exam_time', label: 'Exam time', type: 'time' },
          { name: 'venue', label: 'Venue', type: 'text' },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
      />
    </AdminShell>
  )
}
