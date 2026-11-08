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

interface StudentRow {
  fullName: string
  studentId: string
}

export async function POST(request: NextRequest) {
  const headAdmin = await verifyHeadAdmin()
  if (!headAdmin) {
    return NextResponse.json({ error: 'Only the Head Admin can create accounts.' }, { status: 403 })
  }

  const body = await request.json()
  const { students, sharedPassword, role } = body as {
    students: StudentRow[]
    sharedPassword: string
    role: 'student' | 'content_admin'
  }

  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: 'No students provided.' }, { status: 400 })
  }
  if (!sharedPassword || sharedPassword.length < 6) {
    return NextResponse.json({ error: 'Shared password must be at least 6 characters.' }, { status: 400 })
  }
  if (role !== 'student' && role !== 'content_admin') {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }
  if (students.length > 200) {
    return NextResponse.json({ error: 'Please add at most 200 accounts at a time.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const results: { studentId: string; fullName: string; success: boolean; error?: string }[] = []

  for (const row of students) {
    const fullName = (row.fullName || '').trim()
    const studentId = (row.studentId || '').trim()

    if (!fullName || !studentId) {
      results.push({ studentId, fullName, success: false, error: 'Missing name or ID.' })
      continue
    }

    const email = studentIdToEmail(studentId)

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password: sharedPassword,
      email_confirm: true,
    })

    if (authError || !authUser.user) {
      results.push({ studentId, fullName, success: false, error: authError?.message || 'Failed to create account.' })
      continue
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
      results.push({ studentId, fullName, success: false, error: profileError.message })
      continue
    }

    results.push({ studentId, fullName, success: true })
  }

  const successCount = results.filter((r) => r.success).length
  return NextResponse.json({ successCount, total: students.length, results })
}
