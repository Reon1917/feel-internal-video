"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? email);

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/dashboard",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
          });

    setIsPending(false);

    if (result.error) {
      setError(
        mode === "sign-up"
          ? "Signup failed. Check that this email is whitelisted."
          : "Sign in failed. Check your credentials or whitelist status.",
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#181713]/10 bg-white/75 p-6 shadow-xl shadow-[#181713]/10">
      <div className="mb-6 flex rounded-full bg-[#efe8d8] p-1">
        {(["sign-in", "sign-up"] as const).map((option) => (
          <button
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === option
                ? "bg-[#181713] text-white"
                : "text-[#5c5548] hover:text-[#181713]"
            }`}
            key={option}
            onClick={() => setMode(option)}
            type="button"
          >
            {option === "sign-in" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <label className="block">
            <span className="text-sm font-semibold text-[#474237]">Name</span>
            <input
              className="mt-2 w-full rounded-xl border border-[#181713]/15 bg-white px-4 py-3 text-[#181713] outline-none transition focus:border-[#1d5b4f]"
              name="name"
              placeholder="Restaurant team member"
              required
              type="text"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-[#474237]">Email</span>
          <input
            className="mt-2 w-full rounded-xl border border-[#181713]/15 bg-white px-4 py-3 text-[#181713] outline-none transition focus:border-[#1d5b4f]"
            name="email"
            placeholder="name@gmail.com"
            required
            type="email"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#474237]">Password</span>
          <input
            className="mt-2 w-full rounded-xl border border-[#181713]/15 bg-white px-4 py-3 text-[#181713] outline-none transition focus:border-[#1d5b4f]"
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
            required
            type="password"
          />
        </label>

        {error ? (
          <p className="rounded-xl bg-[#c8412d]/10 px-4 py-3 text-sm font-medium text-[#9f3021]">
            {error}
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-[#1d5b4f] px-5 py-3 font-semibold text-white transition hover:bg-[#174a40] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
