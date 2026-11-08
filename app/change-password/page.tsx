'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      setLoading(false)
      setError('Your session expired. Please log in again.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setLoading(false)
      setError(updateError.message)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('auth_user_id', userData.user.id)
      .select('role')
      .single()

    setLoading(false)

    if (profileError) {
      setError('Password was updated, but something went wrong finishing setup. Try refreshing.')
      return
    }

    router.push(profile?.role === 'student' ? '/dashboard' : '/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-strong rainbow-ring rounded-[28px] p-8 text-white">
        <h1 className="page-title text-2xl font-semibold mb-1">Set your password</h1>
        <p className="text-sm text-purple-100/90 mb-6">
          You're using a temporary password. Choose a new one that only you know before continuing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-purple-200/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-purple-100 mb-1">
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-purple-200/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              placeholder="Re-enter your new password"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-50 bg-rose-500/30 border border-rose-200/40 rounded-2xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full py-3 transition-all"
          >
            {loading ? 'Saving...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
