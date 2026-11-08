export function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export function dueLabel(dateStr: string): { label: string; tone: 'default' | 'warning' | 'danger' | 'muted' } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Overdue', tone: 'danger' }
  if (diffDays === 0) return { label: 'Due today', tone: 'warning' }
  if (diffDays === 1) return { label: 'Due tomorrow', tone: 'warning' }
  if (diffDays <= 7) return { label: `Due in ${diffDays} days`, tone: 'default' }
  return { label: `Due ${formatDateShort(dateStr)}`, tone: 'muted' }
}

export function examCountdown(dateStr: string): { label: string; tone: 'default' | 'warning' | 'danger' | 'muted' } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Completed', tone: 'muted' }
  if (diffDays === 0) return { label: 'Today', tone: 'danger' }
  if (diffDays === 1) return { label: 'Tomorrow', tone: 'warning' }
  return { label: `In ${diffDays} days`, tone: 'default' }
}
