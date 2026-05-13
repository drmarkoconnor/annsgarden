import { AppShell } from "@/components/app-shell";
import { signOut } from "@/lib/auth/actions";
import { getSignedInClaims } from "@/lib/auth/guards";

const moreItems = [
  {
    title: "Profiles",
    label: "Settings",
    description: "Ann, Mark and Alicia will live here when profiles are added.",
  },
  {
    title: "Garden setup",
    label: "Admin",
    description: "A place for core garden details and default lists.",
  },
  {
    title: "Categories",
    label: "Admin",
    description: "Plants, pruning, pest watch, compost and other task groups.",
  },
  {
    title: "Later ideas",
    label: "Future",
    description: "A quiet parking place for ideas outside the current phase.",
  },
];

export const dynamic = "force-dynamic";

export default async function MorePage() {
  const claims = await getSignedInClaims();
  const signedInEmail =
    claims && "email" in claims && typeof claims.email === "string"
      ? claims.email
      : "Signed in";

  return (
    <AppShell activeItem="more">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">More</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Supporting areas for the app, kept simple for now.
          </p>
        </section>

        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-700">App access</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-950">
                Protected by Supabase Auth
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                {signedInEmail}
              </p>
            </div>
            <form action={signOut}>
              <button
                className="w-full cursor-pointer rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 sm:w-auto"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-3">
          {moreItems.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-stone-500">{item.label}</p>
                  <h2 className="mt-1 text-base font-semibold text-stone-950">
                    {item.title}
                  </h2>
                </div>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                  Static
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {item.description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
