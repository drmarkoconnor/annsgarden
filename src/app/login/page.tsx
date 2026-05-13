import Image from "next/image";
import { redirect } from "next/navigation";
import coverImage from "@/assets/cover.jpeg";
import { signInWithPassword } from "@/lib/auth/actions";
import { getSignedInClaims } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type LoginSearchParams = {
  authError?: string;
  email?: string;
  next?: string;
  signedOut?: string;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>;
}) {
  const notices = searchParams ? await searchParams : {};
  const claims = await getSignedInClaims();

  if (claims) {
    redirect("/");
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-stone-950 text-white">
      <Image
        alt="Ann in her garden"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={coverImage}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-stone-950/5 to-stone-950/80"
      />
      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-between px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-12">
        <div className="max-w-sm pt-6">
          <p className="text-sm font-semibold text-white/85">
            Ann&apos;s Garden Planner
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-white">
            Welcome to Ann&apos;s garden
          </h1>
          <p className="mt-3 max-w-xs text-base leading-7 text-white/85">
            A quiet place for the jobs, notes and photos that keep the garden
            moving.
          </p>
        </div>

        <div className="w-full rounded-lg border border-white/20 bg-[#fdfcf8]/90 p-4 text-stone-950 shadow-2xl backdrop-blur-md sm:mb-6 sm:max-w-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-emerald-700">Private app</p>
              <h2 className="mt-1 text-xl font-semibold text-stone-950">
                Sign in
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
              Protected
            </span>
          </div>

          <LoginNotice notices={notices} />

          <form action={signInWithPassword} className="mt-4 space-y-3">
            <input type="hidden" name="next" value={notices.next ?? "/"} />
            <label className="block text-sm font-medium text-stone-700">
              Email
              <input
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
                defaultValue={notices.email ?? ""}
                name="email"
                required
                type="email"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Password
              <input
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function LoginNotice({ notices }: { notices: LoginSearchParams }) {
  if (notices.signedOut === "1") {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
        Signed out.
      </div>
    );
  }

  if (!notices.authError) {
    return null;
  }

  const message =
    notices.authError === "missing"
      ? "Enter an email and password."
      : "Those sign-in details were not recognised.";

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
      {message}
    </div>
  );
}
