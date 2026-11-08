'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const links = [
  { href: '/dashboard', label: 'Home' },
  { href: '/information', label: 'Info' },
  { href: '/memories', label: 'Memories' },
  { href: '/assignments', label: 'Assign.' },
  { href: '/exams', label: 'Exams' },
  { href: '/attendance', label: 'Attend.' },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 glass flex z-30">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex-1 text-center py-2.5 text-[11px] font-medium',
            pathname === link.href ? 'text-white' : 'text-purple-100/80'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
