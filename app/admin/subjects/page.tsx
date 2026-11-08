import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import CrudManager from '@/components/admin/CrudManager'

export default async function AdminSubjectsPage() {
  const { profile } = await requireProfile(['head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Subjects</h1>
      <CrudManager
        table="subjects"
        classId={profile.class_id!}
        createdBy={profile.id}
        trackCreator={false}
        titleField="name"
        emptyMessage="No subjects yet. Click + Add to create one."
        subtitleFormatter={(item) => `${item.code || ''}${item.teacher_name ? ' · ' + item.teacher_name : ''}`}
        fields={[
          { name: 'name', label: 'Subject name', type: 'text', required: true },
          { name: 'code', label: 'Subject code', type: 'text' },
          { name: 'teacher_name', label: 'Teacher name', type: 'text' },
        ]}
      />
    </AdminShell>
  )
}
