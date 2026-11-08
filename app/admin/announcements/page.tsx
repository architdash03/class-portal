import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import CrudManager from '@/components/admin/CrudManager'
import { formatDate } from '@/lib/utils/date'

export default async function AdminAnnouncementsPage() {
  const { profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Announcements</h1>
      <CrudManager
        table="announcements"
        classId={profile.class_id!}
        createdBy={profile.id}
        titleField="title"
        emptyMessage="No announcements yet. Click + Add to create one."
        subtitleFormatter={(item) => formatDate(item.created_at.split('T')[0])}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'priority', label: 'Priority', type: 'priority' },
        ]}
      />
    </AdminShell>
  )
}
