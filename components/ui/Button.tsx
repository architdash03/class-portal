import { cn } from '@/lib/utils/cn'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-gradient-to-r from-fuchsia-500 via-purple-600 to-violet-600 hover:brightness-110 text-white shadow-lg shadow-purple-900/30',
    secondary: 'bg-white/70 border border-purple-200 text-purple-800 hover:bg-white',
    danger: 'bg-gradient-to-r from-rose-500 to-orange-400 hover:brightness-110 text-white',
    ghost: 'text-purple-100 hover:bg-white/15',
  }
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
  }

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
