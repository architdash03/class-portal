import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import StudentManager from '@/components/admin/StudentManager'

export default async function AdminStudentsPage() {
  const { supabase, profile } = await requireProfile(['head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('class_id', profile.class_id)
    .order('full_name')

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Students &amp; Content Admins</h1>
      <p className="page-subtitle text-sm mb-4">
        Create accounts, disable access, or reset a forgotten password.
      </p>
      <StudentManager initialProfiles={profiles || []} />
    </AdminShell>
  )
}
