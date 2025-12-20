import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AuthMode = 'sign-in' | 'sign-up'
type BannerTone = 'error' | 'success'

type BannerMessage = {
  tone: BannerTone
  text: string
}

export default function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<BannerMessage | null>(null)

  useEffect(() => {
    if (!supabase) {
      return
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!supabase) {
      setMessage({
        tone: 'error',
        text: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth.',
      })
      return
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setMessage({ tone: 'error', text: 'Email and password are required.' })
      return
    }

    setPending(true)
    setMessage(null)

    const { data, error } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          })
        : await supabase.auth.signUp({
            email: trimmedEmail,
            password,
          })

    if (error) {
      setMessage({ tone: 'error', text: error.message })
      setPending(false)
      return
    }

    if (mode === 'sign-up' && data.user && !data.session) {
      setMessage({
        tone: 'success',
        text: 'Check your email to confirm your account.',
      })
    } else {
      setMessage({ tone: 'success', text: 'Signed in successfully.' })
    }

    setPassword('')
    setPending(false)
  }

  const signOut = async () => {
    if (!supabase) {
      return
    }

    setPending(true)
    setMessage(null)
    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage({ tone: 'error', text: error.message })
    }

    setPending(false)
  }

  return (
    <section
      id="auth"
      className="relative rounded-3xl border border-black/5 bg-white/80 p-6 shadow-xl shadow-amber-900/10 backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
            Auth Preview
          </p>
          <h2 className="font-display text-2xl text-slate-900">
            Email + password
          </h2>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Supabase
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        Use this panel to validate the auth wiring while we build the
        whitelisting flow.
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <span className="font-semibold">VITE_SUPABASE_URL</span> and{' '}
          <span className="font-semibold">VITE_SUPABASE_ANON_KEY</span> to
          <code className="mx-1 rounded bg-amber-100 px-1 py-0.5">
            .env.local
          </code>
          to enable auth.
        </div>
      )}

      {session ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Signed in as <span className="font-semibold">{session.user.email}</span>
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={submitAuth}>
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="chef@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={
              mode === 'sign-in' ? 'current-password' : 'new-password'
            }
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="bg-white"
          />
        </div>

        {message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              message.tone === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            disabled={pending || !isSupabaseConfigured}
            className="h-11 rounded-full bg-slate-900 text-white hover:bg-slate-800"
          >
            {pending
              ? 'Working...'
              : mode === 'sign-in'
                ? 'Sign in'
                : 'Create account'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setMode((current) =>
                current === 'sign-in' ? 'sign-up' : 'sign-in'
              )
            }
            className="h-11 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Switch to {mode === 'sign-in' ? 'sign up' : 'sign in'}
          </Button>
          {session ? (
            <Button
              type="button"
              variant="ghost"
              onClick={signOut}
              disabled={pending}
              className="h-11 rounded-full text-slate-600 hover:bg-slate-100"
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
