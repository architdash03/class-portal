import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import CrudManager from '@/components/admin/CrudManager'
import { formatDate } from '@/lib/utils/date'

export default async function AdminClassUpdatesPage() {
  const { supabase, profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)
  const { data: subjects } = await supabase.from('subjects').select('*').eq('class_id', profile.class_id).order('name')

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">What Was Taught</h1>
      <p className="text-sm text-slate-500 mb-4">Add a class update every time you teach something new.</p>
      <CrudManager
        table="class_updates"
        classId={profile.class_id!}
        createdBy={profile.id}
        subjects={subjects || []}
        titleField="topic"
        emptyMessage="No class updates yet. Click + Add to create one."
        subtitleFormatter={(item) => `${item.subjects?.name || 'No subject'} · ${formatDate(item.taught_date)}`}
        fields={[
          { name: 'topic', label: 'Topic', type: 'text', required: true },
          { name: 'subject_id', label: 'Subject', type: 'subject' },
          { name: 'teacher_name', label: 'Teacher name', type: 'text' },
          { name: 'taught_date', label: 'Date taught', type: 'date', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]}
      />
    </AdminShell>
  )
}
