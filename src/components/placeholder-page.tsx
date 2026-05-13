import { AppShell } from "@/components/app-shell";
import type { NavItemId } from "@/components/bottom-nav";

type PlaceholderPageProps = {
  activeItem: NavItemId;
  title: string;
  eyebrow: string;
  description: string;
};

export function PlaceholderPage({
  activeItem,
  title,
  eyebrow,
  description,
}: PlaceholderPageProps) {
  return (
    <AppShell activeItem={activeItem}>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-700">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-normal text-stone-950">
            {title}
          </h1>
          <p className="max-w-sm text-base leading-7 text-stone-600">
            {description}
          </p>
        </div>

        <article className="rounded-lg border border-dashed border-stone-300 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-stone-700">Placeholder</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            This Phase 1 screen is ready for the static prototype work in Phase 2.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
