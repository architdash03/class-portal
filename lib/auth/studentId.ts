/**
 * Converts a student ID into the internal email format Supabase Auth needs.
 * Students never see or type this email — they only ever use their ID.
 * Example: "CS2024001" -> "cs2024001@studentportal.local"
 */
export function studentIdToEmail(studentId: string): string {
  const domain = process.env.NEXT_PUBLIC_STUDENT_ID_EMAIL_DOMAIN
  const cleanId = studentId.trim().toLowerCase()
  return `${cleanId}@${domain}`
}
