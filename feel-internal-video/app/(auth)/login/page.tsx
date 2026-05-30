import Link from "next/link";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-8 text-[#181713]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <section>
          <Link
            className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1d5b4f]"
            href="/"
          >
            Feel Internal Video
          </Link>
          <h1 className="mt-8 max-w-2xl text-5xl font-semibold leading-none tracking-[-0.02em] sm:text-6xl">
            Staff access starts with the whitelist.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#5c5548]">
            Use a whitelisted email to sign in or create your account. Admins
            can add users, revoke access, and manage the internal video library.
          </p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
