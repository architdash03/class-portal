import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import NotificationListClient from '@/components/dashboard/NotificationListClient'

export default async function NotificationsPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h1>
      <NotificationListClient initialItems={notifications || []} />
    </AppShell>
  )
}
