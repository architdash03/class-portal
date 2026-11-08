'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { Role } from '@/types/database'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/information', label: 'Information' },
  { href: '/admin/memories', label: 'Memories' },
  { href: '/admin/students', label: 'Students', headOnly: true },
  { href: '/admin/subjects', label: 'Subjects', headOnly: true },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/assignments', label: 'Assignments' },
  { href: '/admin/homework', label: 'Homework' },
  { href: '/admin/exams', label: 'Exams' },
  { href: '/admin/class-updates', label: 'What Was Taught' },
  { href: '/admin/attendance', label: 'Attendance' },
  { href: '/admin/settings', label: 'Settings', headOnly: true },
]

export default function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const visibleLinks = links.filter((l) => !l.headOnly || role === 'head_admin')

  return (
    <nav className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 overflow-x-auto">
      <ul className="flex gap-2 min-w-max">
        {visibleLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'block rounded-full px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap',
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
