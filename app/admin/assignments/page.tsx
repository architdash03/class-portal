import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import CrudManager from '@/components/admin/CrudManager'
import { formatDate } from '@/lib/utils/date'

export default async function AdminAssignmentsPage() {
  const { supabase, profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)
  const { data: subjects } = await supabase.from('subjects').select('*').eq('class_id', profile.class_id).order('name')

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Assignments</h1>
      <CrudManager
        table="assignments"
        classId={profile.class_id!}
        createdBy={profile.id}
        subjects={subjects || []}
        titleField="title"
        emptyMessage="No assignments yet. Click + Add to create one."
        subtitleFormatter={(item) => `${item.subjects?.name || 'No subject'} · Due ${formatDate(item.due_date)}`}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subject_id', label: 'Subject', type: 'subject' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'submission_instructions', label: 'Submission instructions', type: 'text' },
          { name: 'assigned_date', label: 'Assigned date', type: 'date', required: true },
          { name: 'due_date', label: 'Due date', type: 'date', required: true },
          { name: 'reminder_date', label: 'Reminder date', type: 'date' },
        ]}
      />
    </AdminShell>
  )
}
