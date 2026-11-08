export type Role = 'student' | 'content_admin' | 'head_admin'
export type Priority = 'normal' | 'important' | 'urgent'
export type CompletionStatus = 'pending' | 'completed'
export type AttendanceStatus = 'present' | 'absent' | 'leave'

export interface Profile {
  id: string
  auth_user_id: string
  full_name: string
  student_id: string | null
  email: string | null
  role: Role
  class_id: string | null
  is_active: boolean
  must_change_password: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  class_id: string
  name: string
  code: string | null
  teacher_name: string | null
  created_at: string
}

export interface Announcement {
  id: string
  class_id: string
  title: string
  description: string
  priority: Priority
  attachment_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  class_id: string
  subject_id: string | null
  title: string
  description: string | null
  assigned_date: string
  due_date: string
  reminder_date: string | null
  submission_instructions: string | null
  attachment_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  subjects?: { name: string } | null
}

export interface AssignmentStatusRow {
  id: string
  assignment_id: string
  student_id: string
  status: CompletionStatus
  completed_at: string | null
}

export interface Homework {
  id: string
  class_id: string
  subject_id: string | null
  title: string
  description: string | null
  assigned_date: string
  due_date: string
  reminder_date: string | null
  attachment_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  subjects?: { name: string } | null
}

export interface HomeworkStatusRow {
  id: string
  homework_id: string
  student_id: string
  status: CompletionStatus
  completed_at: string | null
}

export interface ClassUpdate {
  id: string
  class_id: string
  subject_id: string | null
  topic: string
  description: string | null
  teacher_name: string | null
  taught_date: string
  attachment_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  subjects?: { name: string } | null
}

export interface Exam {
  id: string
  class_id: string
  subject_id: string | null
  exam_name: string
  exam_date: string
  exam_time: string | null
  venue: string | null
  description: string | null
  attachment_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  subjects?: { name: string } | null
}

export interface AttendanceRow {
  id: string
  class_id: string
  subject_id: string | null
  student_id: string
  attendance_date: string
  status: AttendanceStatus
  marked_by: string | null
  subjects?: { name: string } | null
  profiles?: { full_name: string; student_id: string | null } | null
}

export interface NotificationRow {
  id: string
  class_id: string
  student_id: string
  title: string
  message: string
  notification_type: 'assignment' | 'homework' | 'exam' | 'announcement' | 'general'
  related_id: string | null
  is_read: boolean
  created_at: string
}

export interface ClassInformation {
  id: string
  class_id: string
  title: string
  details: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MemoryPhoto {
  id: string
  memory_id: string
  image_url: string
  caption: string
  sort_order: number
  created_at: string
}

export interface ClassMemory {
  id: string
  class_id: string
  title: string
  description: string
  event_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
  memory_photos?: MemoryPhoto[]
}

export interface ClassSettings {
  id: string
  class_id: string
  website_name: string
  class_description: string | null
  whatsapp_group_url: string | null
  whatsapp_channel_url: string | null
  updated_at: string
}
