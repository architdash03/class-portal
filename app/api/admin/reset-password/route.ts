import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyHeadAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).single()
  if (!profile || profile.role !== 'head_admin') return null
  return profile
}

export async function PATCH(request: NextRequest) {
  const headAdmin = await verifyHeadAdmin()
  if (!headAdmin) {
    return NextResponse.json({ error: 'Only the Head Admin can reset passwords.' }, { status: 403 })
  }

  const { authUserId, newPassword } = await request.json()
  if (!authUserId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'A valid new password (6+ characters) is required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(authUserId, { password: newPassword })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Force the student to set their own new password on next login.
  await admin.from('profiles').update({ must_change_password: true }).eq('auth_user_id', authUserId)

  return NextResponse.json({ success: true })
}
