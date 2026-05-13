import { redirect } from "next/navigation";
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
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 px-4 py-8 text-stone-950">
      <section className="w-full max-w-sm rounded-lg border border-stone-200 bg-[#fdfcf8] p-5 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Ann&apos;s Garden</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-950">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Protected access for Ann, Mark and Alicia.
        </p>

        <LoginNotice notices={notices} />

        <form action={signInWithPassword} className="mt-5 space-y-4">
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
