import Link from "next/link";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="flex max-w-2xl flex-col gap-6">
          <Link className="text-xs font-semibold uppercase tracking-widest" href="/">
            Feel Internal Video
          </Link>
          <h1 className="text-5xl font-semibold leading-none tracking-normal sm:text-6xl">
            Whitelist first.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Use the same email your admin approved.
          </p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
