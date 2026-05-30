"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="rounded-full border border-[#181713]/15 px-4 py-2 text-sm font-semibold text-[#181713] transition hover:border-[#c8412d] hover:text-[#c8412d] disabled:opacity-60"
      disabled={isPending}
      onClick={signOut}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
