import { cn } from '@/lib/utils/cn'
import { HTMLAttributes } from 'react'

export default function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('glass-card rainbow-ring', className)}
      {...props}
    >
      {children}
    </div>
  )
}
