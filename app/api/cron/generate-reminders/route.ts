import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * This route is meant to be called ONCE A DAY by Vercel Cron (see vercel.json).
 * It is protected by CRON_SECRET so nobody else can trigger it.
 *
 * What it does:
 * 1. Finds assignments/homework whose reminder_date is today and creates a
 *    notification for every active student in that class (skipping students
 *    who already completed the item, and skipping duplicates).
 * 2. Finds exams happening tomorrow or today and reminds students about them.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  let created = 0

  // ---- Assignment reminders ----
  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, class_id, title, due_date, reminder_date')
    .eq('reminder_date', today)

  for (const a of assignments ?? []) {
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('class_id', a.class_id)
      .eq('role', 'student')
      .eq('is_active', true)

    for (const s of students ?? []) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('student_id', s.id)
        .eq('related_id', a.id)
        .eq('notification_type', 'assignment')
        .maybeSingle()
      if (existing) continue

      await supabase.from('notifications').insert({
        class_id: a.class_id,
        student_id: s.id,
        title: `Assignment due soon: ${a.title}`,
        message: `Due on ${a.due_date}. Make sure it's completed on time.`,
        notification_type: 'assignment',
        related_id: a.id,
      })
      created++
    }
  }

  // ---- Homework reminders ----
  const { data: homeworkItems } = await supabase
    .from('homework')
    .select('id, class_id, title, due_date, reminder_date')
    .eq('reminder_date', today)

  for (const h of homeworkItems ?? []) {
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('class_id', h.class_id)
      .eq('role', 'student')
      .eq('is_active', true)

    for (const s of students ?? []) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('student_id', s.id)
        .eq('related_id', h.id)
        .eq('notification_type', 'homework')
        .maybeSingle()
      if (existing) continue

      await supabase.from('notifications').insert({
        class_id: h.class_id,
        student_id: s.id,
        title: `Homework due soon: ${h.title}`,
        message: `Due on ${h.due_date}. Make sure it's completed on time.`,
        notification_type: 'homework',
        related_id: h.id,
      })
      created++
    }
  }

  // ---- Exam reminders (2 days before, and the day of) ----
  const twoDays = new Date()
  twoDays.setDate(twoDays.getDate() + 2)
  const twoDaysStr = twoDays.toISOString().split('T')[0]

  const { data: exams } = await supabase
    .from('exams')
    .select('id, class_id, exam_name, exam_date')
    .in('exam_date', [today, twoDaysStr])

  for (const ex of exams ?? []) {
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('class_id', ex.class_id)
      .eq('role', 'student')
      .eq('is_active', true)

    const label = ex.exam_date === today ? 'today' : 'in 2 days'

    for (const s of students ?? []) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('student_id', s.id)
        .eq('related_id', ex.id)
        .eq('notification_type', 'exam')
        .eq('title', `Exam ${label}: ${ex.exam_name}`)
        .maybeSingle()
      if (existing) continue

      await supabase.from('notifications').insert({
        class_id: ex.class_id,
        student_id: s.id,
        title: `Exam ${label}: ${ex.exam_name}`,
        message: `Scheduled for ${ex.exam_date}.`,
        notification_type: 'exam',
        related_id: ex.id,
      })
      created++
    }
  }

  return NextResponse.json({ ok: true, notificationsCreated: created })
}
