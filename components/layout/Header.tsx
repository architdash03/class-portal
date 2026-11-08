import Link from 'next/link'
import LogoutButton from './LogoutButton'
import NotificationBell from '@/components/notifications/NotificationBell'
import type { Profile } from '@/types/database'

export default function Header({ profile, websiteName }: { profile: Profile; websiteName: string }) {
  return (
    <header className="glass sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-white text-sm sm:text-base">
          {websiteName}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-purple-100">{profile.full_name}</span>
          <NotificationBell studentId={profile.id} />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
