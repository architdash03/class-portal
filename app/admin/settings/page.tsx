import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const { supabase, profile } = await requireProfile(['head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)

  const { data: settings } = await supabase
    .from('class_settings')
    .select('*')
    .eq('class_id', profile.class_id)
    .single()

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Website Settings</h1>
      <SettingsForm initialSettings={settings} classId={profile.class_id!} />
    </AdminShell>
  )
}
