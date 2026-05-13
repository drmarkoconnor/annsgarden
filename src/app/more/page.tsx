import { AppShell } from "@/components/app-shell";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { ProfileForm } from "@/components/admin/profile-form";
import type { ReactNode } from "react";
import { archiveCategory, restoreCategory } from "@/lib/admin/actions";
import { getAdminData } from "@/lib/admin/data";
import type { CategoryRecord, ProfileRecord } from "@/lib/admin/data";
import { signOut } from "@/lib/auth/actions";
import { getSignedInClaims } from "@/lib/auth/guards";

type MoreSearchParams = {
  adminError?: string;
  saved?: string;
};

export const dynamic = "force-dynamic";

export default async function MorePage({
  searchParams,
}: {
  searchParams?: Promise<MoreSearchParams>;
}) {
  const notices = searchParams ? await searchParams : {};
  const claims = await getSignedInClaims();
  const { activeCategories, archivedCategories, profiles } = await getAdminData();
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

        <AdminNotice notices={notices} />

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
                className="w-full cursor-pointer rounded-md border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 sm:w-auto"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Profiles" count={profiles.length} />
          <div className="grid gap-3">
            {profiles.map((profile) => (
              <ProfileRow key={profile.id} profile={profile} />
            ))}
          </div>
        </section>

        <details className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
            Add category
          </summary>
          <div className="mt-4">
            <CategoryForm submitLabel="Save category" />
          </div>
        </details>

        <section className="space-y-3">
          <SectionHeader title="Categories" count={activeCategories.length} />
          <div className="grid gap-3">
            {activeCategories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </div>
        </section>

        {archivedCategories.length ? (
          <ArchivedSection
            count={archivedCategories.length}
            title="Archived categories"
          >
            {archivedCategories.map((category) => (
              <form
                action={restoreCategory.bind(null, category.id)}
                className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2"
                key={category.id}
              >
                <span className="text-sm font-medium text-stone-700">
                  {formatCategoryName(category.name)}
                </span>
                <button
                  className="cursor-pointer text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                  type="submit"
                >
                  Restore
                </button>
              </form>
            ))}
          </ArchivedSection>
        ) : null}
      </div>
    </AppShell>
  );
}

function AdminNotice({ notices }: { notices: MoreSearchParams }) {
  if (notices.saved === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Admin update saved.
      </div>
    );
  }

  if (!notices.adminError) {
    return null;
  }

  const messages: Record<string, string> = {
    "duplicate-category": "That category already exists for this type.",
    "duplicate-profile": "That profile email is already in use.",
    "save-failed": "The admin update could not be saved.",
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      {messages[notices.adminError] ?? messages["save-failed"]}
    </div>
  );
}

function SectionHeader({ count, title }: { count: number; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      <span className="text-sm font-medium text-stone-500">{count}</span>
    </div>
  );
}

function ProfileRow({ profile }: { profile: ProfileRecord }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">
            {formatProfileRole(profile.role)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {profile.display_name}
          </h3>
          {profile.email ? (
            <p className="mt-1 text-sm leading-6 text-stone-600">{profile.email}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
          Profile
        </span>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
          Edit profile
        </summary>
        <div className="mt-3">
          <ProfileForm profile={profile} />
        </div>
      </details>
    </article>
  );
}

function CategoryRow({ category }: { category: CategoryRecord }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">
            {formatCategoryType(category.type)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {formatCategoryName(category.name)}
          </h3>
        </div>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
          {category.display_order}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
            Edit category
          </summary>
          <div className="mt-3">
            <CategoryForm category={category} submitLabel="Update category" />
          </div>
        </details>
        <ConfirmActionForm
          action={archiveCategory.bind(null, category.id)}
          confirmLabel="Archive category"
          confirmMessage={`Archive ${formatCategoryName(category.name)}? It will be hidden from new selections.`}
        >
          <button
            className="w-full cursor-pointer rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-900"
            type="submit"
          >
            Archive category
          </button>
        </ConfirmActionForm>
      </div>
    </article>
  );
}

function ArchivedSection({
  children,
  count,
  title,
}: {
  children: ReactNode;
  count: number;
  title: string;
}) {
  return (
    <details open className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-stone-800">
        {title} ({count})
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

function formatCategoryName(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatCategoryType(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)} category`;
}

function formatProfileRole(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
