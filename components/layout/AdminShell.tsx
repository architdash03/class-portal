import Link from 'next/link'
import LogoutButton from './LogoutButton'
import AdminSidebar from './AdminSidebar'
import type { Profile } from '@/types/database'

export default function AdminShell({
  profile,
  websiteName,
  children,
}: {
  profile: Profile
  websiteName: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/admin/dashboard" className="font-semibold text-white text-sm sm:text-base">
            {websiteName} · Admin
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-purple-100">
              {profile.full_name} · {profile.role === 'head_admin' ? 'Head Admin' : 'Content Admin'}
            </span>
            <LogoutButton />
          </div>
        </div>
        <AdminSidebar role={profile.role} />
      </header>
      <div className="max-w-6xl mx-auto">
        <main className="min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
