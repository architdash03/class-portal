import { cn } from '@/lib/utils/cn'
import { TextareaHTMLAttributes } from 'react'

export default function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-purple-200/80 bg-white/80 px-3 py-2 text-sm text-purple-950 placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-400',
        className
      )}
      rows={3}
      {...props}
    />
  )
}
