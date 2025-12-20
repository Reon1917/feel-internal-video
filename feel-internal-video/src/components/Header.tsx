import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-amber-100/60 bg-[#f7f2ea]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-lg shadow-slate-900/30">
            FV
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Internal Ops
            </p>
            <p className="font-display text-lg text-slate-900">
              Feel Internal Video
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#startup" className="transition hover:text-slate-900">
            Startup
          </a>
          <a href="#auth" className="transition hover:text-slate-900">
            Auth
          </a>
          <a href="#migration" className="transition hover:text-slate-900">
            Migration Guide
          </a>
        </nav>

        <a
          href="#auth"
          className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
        >
          Sign In
        </a>
      </div>

      <div className="px-6 pb-4 md:hidden">
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          <a href="#startup" className="transition hover:text-slate-900">
            Startup
          </a>
          <a href="#auth" className="transition hover:text-slate-900">
            Auth
          </a>
          <a href="#migration" className="transition hover:text-slate-900">
            Migration
          </a>
        </div>
      </div>
    </header>
  )
}
