"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

function getPasswordError(password: string, confirmPassword: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const name = String(formData.get("name") ?? email);

    if (mode === "sign-up") {
      const passwordError = getPasswordError(password, confirmPassword);

      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsPending(true);

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
            onClick={() => {
              setError(null);
              setMode(option);
            }}
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
            autoComplete="email"
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
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
            pattern={mode === "sign-up" ? "^(?=.*[A-Za-z])(?=.*\\d).{8,}$" : undefined}
            required
            title="Use at least 8 characters with at least one letter and one number."
            type="password"
          />
        </label>

        {mode === "sign-up" ? (
          <>
            <label className="block">
              <span className="text-sm font-semibold text-[#474237]">
                Confirm password
              </span>
              <input
                className="mt-2 w-full rounded-xl border border-[#181713]/15 bg-white px-4 py-3 text-[#181713] outline-none transition focus:border-[#1d5b4f]"
                autoComplete="new-password"
                minLength={8}
                name="confirmPassword"
                placeholder="Enter password again"
                required
                type="password"
              />
            </label>
            <p className="rounded-xl bg-[#efe8d8] px-4 py-3 text-sm font-medium leading-6 text-[#5c5548]">
              Use at least 8 characters with one letter and one number.
            </p>
          </>
        ) : null}

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
          {isPending
            ? "Working..."
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
