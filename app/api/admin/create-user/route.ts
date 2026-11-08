import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { studentIdToEmail } from '@/lib/auth/studentId'

async function verifyHeadAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).single()
  if (!profile || profile.role !== 'head_admin') return null
  return profile
}

export async function POST(request: NextRequest) {
  const headAdmin = await verifyHeadAdmin()
  if (!headAdmin) {
    return NextResponse.json({ error: 'Only the Head Admin can create accounts.' }, { status: 403 })
  }

  const body = await request.json()
  const { studentId, fullName, password, role } = body

  if (!studentId || !fullName || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }
  if (role !== 'student' && role !== 'content_admin') {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }

  const email = studentIdToEmail(studentId)
  const admin = createAdminClient()

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authUser.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create account.' }, { status: 400 })
  }

  const { error: profileError } = await admin.from('profiles').insert({
    auth_user_id: authUser.user.id,
    full_name: fullName,
    student_id: studentId,
    email,
    role,
    class_id: headAdmin.class_id,
    is_active: true,
    must_change_password: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
