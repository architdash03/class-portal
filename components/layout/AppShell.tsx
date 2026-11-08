import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import type { Profile } from '@/types/database'

export default function AppShell({
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
      <Header profile={profile} websiteName={websiteName} />
      <div className="max-w-6xl mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
