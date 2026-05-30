import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentAccess } from "@/modules/access/queries";

import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const access = await getCurrentAccess();

  if (access.status === "anonymous") {
    redirect("/login");
  }

  if (!access.isActive) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f1e8] px-5 text-[#181713]">
        <section className="max-w-xl rounded-2xl border border-[#181713]/10 bg-white/80 p-8 shadow-xl shadow-[#181713]/10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c8412d]">
            Access blocked
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            This account is not currently whitelisted.
          </h1>
          <p className="mt-4 leading-7 text-[#5c5548]">
            Your account exists, but video access is disabled until an admin
            reactivates your email in the whitelist.
          </p>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </section>
      </main>
    );
  }

  const cards = [
    { label: "Categories", value: "Folder CRUD", accent: "text-[#1d5b4f]" },
    { label: "Videos", value: "Bunny upload", accent: "text-[#c8412d]" },
    { label: "Whitelist", value: "Email access", accent: "text-[#b18429]" },
  ];

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-6 text-[#181713] sm:px-8">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-[#181713]/10 pb-5">
        <Link
          className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1d5b4f]"
          href="/"
        >
          Feel Internal Video
        </Link>
        <SignOutButton />
      </nav>

      <section className="mx-auto mt-12 w-full max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#837867]">
          Signed in as {access.user.email}
        </p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-[-0.02em]">
              Internal video control room
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5548]">
              This is a temporary authenticated mock page. It confirms session,
              whitelist, and role checks before the real category and video
              screens are built.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#181713] px-4 py-2 text-sm font-semibold text-white">
            Role: {access.user.role}
          </span>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article
              className="rounded-2xl border border-[#181713]/10 bg-white/75 p-6 shadow-sm"
              key={card.label}
            >
              <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${card.accent}`}>
                {card.label}
              </p>
              <h2 className="mt-4 text-3xl font-semibold">{card.value}</h2>
              <p className="mt-3 leading-7 text-[#5c5548]">
                {access.isAdmin
                  ? "Admin permission is active for this module."
                  : "Read access only. Admin actions are hidden and blocked by API checks."}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
