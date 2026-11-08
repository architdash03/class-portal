import { requireProfile } from '@/lib/auth/getProfile'
import { getWebsiteName } from '@/lib/utils/settings'
import AppShell from '@/components/layout/AppShell'
import ClassUpdateTimeline from '@/components/dashboard/ClassUpdateTimeline'

export default async function WhatWasTaughtPage() {
  const { supabase, profile } = await requireProfile(['student'])
  const websiteName = await getWebsiteName(profile.class_id)

  const [{ data: updates }, { data: subjects }] = await Promise.all([
    supabase.from('class_updates').select('*, subjects(name)').eq('class_id', profile.class_id).order('taught_date', { ascending: false }),
    supabase.from('subjects').select('*').eq('class_id', profile.class_id).order('name'),
  ])

  return (
    <AppShell profile={profile} websiteName={websiteName}>
      <h1 className="text-lg font-semibold text-slate-900 mb-1">What Was Taught</h1>
      <p className="text-sm text-slate-500 mb-4">A timeline of what was covered in each class.</p>
      <ClassUpdateTimeline initialItems={(updates || []) as any} subjects={subjects || []} />
    </AppShell>
  )
}
