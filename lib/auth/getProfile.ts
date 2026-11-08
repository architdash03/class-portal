import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'

/**
 * Server-side helper: gets the logged-in user's profile.
 * Redirects to /login if not authenticated.
 * Pass requiredRoles to also enforce role-based access on a page.
 */
export async function requireProfile(requiredRoles?: Profile['role'][]) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    redirect('/login')
  }

  if (requiredRoles && !requiredRoles.includes(profile.role)) {
    if (profile.role === 'student') redirect('/dashboard')
    else redirect('/admin/dashboard')
  }

  return { supabase, profile: profile as Profile }
}
