import { createClient } from '@/lib/supabase/server'

export async function getWebsiteName(classId: string | null): Promise<string> {
  if (!classId) return 'Class Portal'
  const supabase = await createClient()
  const { data } = await supabase
    .from('class_settings')
    .select('website_name')
    .eq('class_id', classId)
    .single()
  return data?.website_name || 'Class Portal'
}
