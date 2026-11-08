'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-white border border-white/40 rounded-full px-3 py-1.5 bg-white/10 hover:bg-white/20 transition-colors"
    >
      Log out
    </button>
  )
}
