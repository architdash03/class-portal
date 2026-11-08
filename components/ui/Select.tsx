import { cn } from '@/lib/utils/cn'
import { SelectHTMLAttributes } from 'react'

export default function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border border-purple-200/80 bg-white/80 px-3 py-2 text-sm text-purple-950 focus:outline-none focus:ring-2 focus:ring-fuchsia-400',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
