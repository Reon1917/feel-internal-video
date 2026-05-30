import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between gap-12 px-4 py-5 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between border-b border-border pb-4">
          <Link className="text-xs font-semibold uppercase tracking-widest" href="/">
            Feel Internal Video
          </Link>
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="flex max-w-2xl flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Private operations library
            </p>
            <h1 className="font-heading text-5xl font-semibold leading-none tracking-wider uppercase sm:text-6xl lg:text-7xl">
              Video SOPs for the team.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Whitelisted staff can watch. Admins manage folders, upload to
              Bunny Stream, and publish videos when they are ready.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/dashboard">Open library</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Create account</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:self-stretch">
            {[
              ["Auth", "Better Auth"],
              ["Data", "Neon + Drizzle"],
              ["Video", "Bunny Stream"],
            ].map(([label, value]) => (
              <div
                className="flex min-h-36 flex-col justify-between border border-border bg-card p-5"
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                <p className="font-heading text-2xl font-semibold uppercase tracking-wider">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-t border-border pt-4 text-sm text-muted-foreground md:grid-cols-3">
          <p>Admin-only upload and folder controls.</p>
          <p>Viewer role sees ready videos only.</p>
          <p>Bunny Player renders after server access checks.</p>
        </div>
      </section>
    </main>
  );
}
