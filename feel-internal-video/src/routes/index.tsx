import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight,
  BadgeCheck,
  ClipboardList,
  KeyRound,
  Layers,
  Video,
} from 'lucide-react'

import AuthPanel from '@/components/AuthPanel'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const startupSteps = [
    {
      title: 'Boot the stack',
      description: 'Install deps and start the dev server for first-run setup.',
      command: 'pnpm install && pnpm dev',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      title: 'Wire Supabase',
      description: 'Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env.local.',
      command: 'cp .env.example .env.local',
      icon: <KeyRound className="h-5 w-5" />,
    },
    {
      title: 'Seed access',
      description: 'Add allowed users and roles in Supabase before sharing.',
      command: 'pnpm db:migrate',
      icon: <BadgeCheck className="h-5 w-5" />,
    },
  ]

  const migrationSteps = [
    {
      title: 'Enable email auth in Supabase',
      detail:
        'Turn on email/password auth and set the redirect URL to localhost:3000 for local testing.',
    },
    {
      title: 'Configure Prisma connection',
      detail:
        'Keep DATABASE_URL for pooling and DIRECT_URL for migrations in .env.local.',
    },
    {
      title: 'Run Prisma migrations',
      detail:
        'Update the schema for allowed_users, profiles, and videos, then run migrations.',
    },
    {
      title: 'Lock down RLS policies',
      detail:
        'Apply Supabase RLS policies so only whitelisted users can sign up and admins can upload.',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f2ea] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl animate-float" />
        <div className="absolute right-10 top-32 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl animate-float" />
      </div>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 shadow-sm">
              Internal recipe video platform
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <h1 className="font-display text-4xl leading-tight text-slate-900 md:text-5xl">
              Train teams faster with one kitchen-ready video hub.
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              A focused internal platform for recipe videos, training sessions,
              and chef playbooks. Built for speed, security, and daily ops use.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                <a href="#startup">Launch checklist</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <a href="#migration">View migration guide</a>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                HLS ready
              </span>
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Private access
              </span>
              <span className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Ops-first UI
              </span>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl shadow-amber-900/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Platform signal
              </p>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                MVP
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl text-slate-900">
              What this foundation includes
            </h2>
            <div className="mt-6 space-y-4">
              {[
                'Auth wiring + Supabase client setup',
                'Prisma-backed data layer ready for migrations',
                'Landing checklist for onboarding',
                'Token-secure playback coming next',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-slate-700"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="startup" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Startup
              </p>
              <h2 className="font-display text-3xl text-slate-900">
                Quick launch checklist
              </h2>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              15 minutes
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {startupSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-amber-900/10"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    {step.icon}
                  </span>
                  {step.title}
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {step.description}
                </p>
                <code className="mt-4 block rounded-2xl bg-slate-900 px-3 py-2 text-xs text-slate-100">
                  {step.command}
                </code>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <AuthPanel />

          <div
            id="migration"
            className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-xl shadow-amber-900/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Migration guide
            </p>
            <h2 className="mt-2 font-display text-2xl text-slate-900">
              Move from starter to secure ops
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Follow these steps to tighten auth, run schema migrations, and
              prepare the video catalog foundation.
            </p>

            <ol className="mt-6 space-y-4 text-sm text-slate-700">
              {migrationSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-slate-600">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              You are using Prisma for data access. Keep the Supabase project as
              the source of truth and apply RLS policies in the dashboard.
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/60 bg-white/70 px-6 py-5 text-xs uppercase tracking-[0.3em] text-slate-500">
          <span>Feel internal video - foundation build</span>
          <span>Next up: allowed users + video catalog</span>
        </footer>
      </main>
    </div>
  )
}
