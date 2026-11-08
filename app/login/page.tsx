'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { studentIdToEmail } from '@/lib/auth/studentId'

export default function LoginPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const email = studentIdToEmail(studentId)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.user) {
      setLoading(false)
      setError('Invalid ID or password. Please try again.')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active, must_change_password')
      .eq('auth_user_id', data.user.id)
      .single()

    setLoading(false)

    if (!profile || !profile.is_active) {
      setError('This account is inactive. Contact your class admin.')
      await supabase.auth.signOut()
      return
    }

    if (profile.must_change_password) {
      router.push('/change-password')
    } else if (profile.role === 'student') {
      router.push('/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-strong rainbow-ring rounded-[28px] p-8 sm:p-10 text-white">
        <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-200 mb-3">Class Portal</p>
        <h1 className="page-title text-3xl font-semibold mb-2">Welcome back</h1>
        <p className="text-sm text-purple-100/90 mb-8">Sign in with your student ID and password.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-purple-100 mb-1">
              ID
            </label>
            <input
              id="studentId"
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-purple-200/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              placeholder="e.g. CS2024001"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-purple-200/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-50 bg-rose-500/30 border border-rose-200/40 rounded-2xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full py-3 shadow-lg shadow-purple-950/40 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
