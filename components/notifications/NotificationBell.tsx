'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ studentId }: { studentId: string }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    async function loadCount() {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('is_read', false)
      setUnread(count || 0)
    }

    loadCount()

    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `student_id=eq.${studentId}` },
        () => loadCount()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [studentId])

  return (
    <Link href="/notifications" className="relative inline-flex items-center p-2 rounded-full hover:bg-white/15">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
