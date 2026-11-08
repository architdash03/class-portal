import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AdminShell from '@/components/layout/AdminShell'
import InfoEditor from '@/components/information/InfoEditor'
import type { ClassInformation } from '@/types/database'

export default async function AdminInformationPage() {
  const { supabase, profile } = await requireProfile(['content_admin', 'head_admin'])
  const websiteName = await getWebsiteName(profile.class_id)
  const { data } = await supabase
    .from('class_information')
    .select('*')
    .eq('class_id', profile.class_id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <AdminShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Class information</h1>
      <p className="page-subtitle text-sm mb-4">
        Write notes students should always see, such as timings, room numbers, and exam rules. Use Edit on a row to change it.
      </p>
      <InfoEditor classId={profile.class_id!} initialRows={(data || []) as ClassInformation[]} />
    </AdminShell>
  )
}
