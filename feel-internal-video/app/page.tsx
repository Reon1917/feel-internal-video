export default function Home() {
  const libraryStats = [
    { label: "Private video library", value: "400" },
    { label: "Average SOP length", value: "3-5m" },
    { label: "Primary region", value: "SG" },
  ];

  const categories = [
    "Kitchen process",
    "Cashier training",
    "Delivery flow",
    "Cleaning SOP",
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f1e8] text-[#181713]">
      <section className="relative isolate min-h-screen px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_18%,rgba(225,107,61,0.18),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(26,96,80,0.18),transparent_30%),linear-gradient(115deg,rgba(255,255,255,0.72),rgba(245,241,232,0.88))]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-2 bg-[linear-gradient(90deg,#1d5b4f_0_24%,#c8412d_24%_42%,#d8a63f_42%_64%,#181713_64%_100%)]" />

        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-[#181713]/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#1d5b4f]">
              Feel Internal Video
            </p>
            <p className="mt-1 text-sm text-[#181713]/60">
              Restaurant operations library
            </p>
          </div>
          <a
            href="/login"
            className="hidden rounded-full border border-[#181713]/15 px-4 py-2 text-sm font-semibold text-[#181713] transition hover:border-[#1d5b4f] hover:text-[#1d5b4f] sm:inline-flex"
          >
            Sign in
          </a>
        </nav>

        <div className="mx-auto grid w-full max-w-7xl gap-12 pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-20">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full bg-[#1d5b4f] px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Private staff training, controlled by whitelist access
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.02em] text-[#181713] sm:text-7xl">
              One calm video hub for every restaurant SOP.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#474237]">
              A focused internal platform for kitchen process videos, cashier
              instructions, delivery guides, cleaning routines, onboarding, and
              operational announcements.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {libraryStats.map((stat) => (
                <div
                  className="border-l-2 border-[#c8412d] bg-white/55 px-4 py-3"
                  key={stat.label}
                >
                  <p className="text-2xl font-semibold text-[#181713]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[#6b6254]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-8 hidden h-36 w-36 rounded-full border border-[#181713]/15 lg:block" />
            <div className="relative rounded-[2rem] border border-[#181713]/10 bg-[#181713] p-3 shadow-2xl shadow-[#181713]/20">
              <div className="overflow-hidden rounded-[1.45rem] bg-[#f8f4eb]">
                <div className="grid gap-px bg-[#181713]/10 sm:grid-cols-[0.38fr_0.62fr]">
                  <aside className="bg-[#fffaf0] p-5">
                    <div className="mb-8 h-2 w-20 rounded-full bg-[#1d5b4f]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#837867]">
                      Categories
                    </p>
                    <div className="mt-4 space-y-3">
                      {categories.map((category, index) => (
                        <div
                          className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm"
                          key={category}
                        >
                          <span
                            className={`h-3 w-3 rounded-full ${
                              index === 0
                                ? "bg-[#c8412d]"
                                : index === 1
                                  ? "bg-[#d8a63f]"
                                  : "bg-[#1d5b4f]"
                            }`}
                          />
                          <span className="text-sm font-semibold text-[#292720]">
                            {category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </aside>

                  <div className="bg-[#f8f4eb] p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#837867]">
                          Now watching
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold">
                          Kitchen opening checklist
                        </h2>
                      </div>
                      <span className="rounded-full bg-[#d8a63f] px-3 py-1 text-xs font-bold text-[#181713]">
                        Ready
                      </span>
                    </div>

                    <div className="aspect-video overflow-hidden rounded-2xl bg-[#1d5b4f] p-4 text-white">
                      <div className="flex h-full flex-col justify-between bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_45%),repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_46px)] p-5">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-[#f5f1e8]" />
                          <span className="h-3 w-3 rounded-full bg-[#f5f1e8]/60" />
                          <span className="h-3 w-3 rounded-full bg-[#f5f1e8]/30" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                            Bunny Stream Player
                          </p>
                          <p className="mt-2 text-3xl font-semibold">
                            Secure playback after access checks
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {["Whitelist", "Admin upload", "Nested folders"].map(
                        (item) => (
                          <div
                            className="rounded-xl border border-[#181713]/10 bg-white p-3 text-sm font-semibold text-[#474237]"
                            key={item}
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          id="platform"
          className="mx-auto mt-14 grid w-full max-w-7xl gap-4 pb-8 md:grid-cols-3"
        >
          <article className="border-t border-[#181713]/15 pt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c8412d]">
              Access
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              Better Auth with email and password
            </h3>
            <p className="mt-3 leading-7 text-[#5c5548]">
              Users can enter only through approved email accounts, with active
              whitelist verification on protected pages and actions.
            </p>
          </article>
          <article className="border-t border-[#181713]/15 pt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1d5b4f]">
              Database
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              Neon Postgres and Drizzle ORM
            </h3>
            <p className="mt-3 leading-7 text-[#5c5548]">
              Auth records, roles, whitelist status, category trees, and Bunny
              video references live in a typed Postgres schema.
            </p>
          </article>
          <article className="border-t border-[#181713]/15 pt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b18429]">
              Video
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              Bunny Stream for storage and playback
            </h3>
            <p className="mt-3 leading-7 text-[#5c5548]">
              The app keeps business logic and metadata while Bunny handles
              upload, processing, CDN delivery, and the player.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
