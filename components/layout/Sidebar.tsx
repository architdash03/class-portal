'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/information', label: 'Information' },
  { href: '/memories', label: 'Memories' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/homework', label: 'Homework' },
  { href: '/exams', label: 'Exam Calendar' },
  { href: '/what-was-taught', label: 'What Was Taught' },
  { href: '/what-did-i-miss', label: 'What Did I Miss?' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/notifications', label: 'Notifications' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:block px-4 sm:px-6 pt-4 overflow-x-auto">
      <ul className="flex gap-2 min-w-max">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'block rounded-full px-3 py-1.5 text-sm whitespace-nowrap',
                pathname === link.href
                  ? 'bg-white text-purple-800 font-semibold shadow'
                  : 'text-white/90 bg-white/10 hover:bg-white/20'
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
