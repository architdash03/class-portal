import { cn } from '@/lib/utils/cn'

type Tone = 'default' | 'warning' | 'danger' | 'muted' | 'success'

const toneStyles: Record<Tone, string> = {
  default: 'bg-fuchsia-100/80 text-fuchsia-800 border-fuchsia-200',
  warning: 'bg-amber-100/80 text-amber-800 border-amber-200',
  danger: 'bg-rose-100/80 text-rose-800 border-rose-200',
  muted: 'bg-white/50 text-purple-700 border-purple-100',
  success: 'bg-teal-100/80 text-teal-800 border-teal-200',
}

export default function Badge({ tone = 'default', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', toneStyles[tone])}>
      {children}
    </span>
  )
}

export function priorityTone(priority: string): Tone {
  if (priority === 'urgent') return 'danger'
  if (priority === 'important') return 'warning'
  return 'default'
}
