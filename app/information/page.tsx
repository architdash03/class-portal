import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import Card from '@/components/ui/Card'
import InfoTable from '@/components/information/InfoTable'
import type { ClassInformation } from '@/types/database'

export default async function InformationPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)
  const { data } = await supabase
    .from('class_information')
    .select('*')
    .eq('class_id', profile.class_id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Class information</h1>
      <Card className="p-5">
        <InfoTable rows={(data || []) as ClassInformation[]} />
      </Card>
    </AppShell>
  )
}
