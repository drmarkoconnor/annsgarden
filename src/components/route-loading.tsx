import { AppShell } from "@/components/app-shell";
import type { NavItemId } from "@/components/bottom-nav";

type RouteLoadingProps = {
  activeItem: NavItemId;
  label?: string;
};

export function RouteLoading({
  activeItem,
  label = "Loading",
}: RouteLoadingProps) {
  return (
    <AppShell activeItem={activeItem}>
      <div className="space-y-6" aria-busy="true" aria-label={label}>
        <section className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-full bg-emerald-100" />
          <div className="h-9 w-48 animate-pulse rounded-md bg-stone-200" />
          <div className="h-5 w-full max-w-sm animate-pulse rounded-md bg-stone-200" />
        </section>

        <div className="grid gap-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="h-4 w-24 animate-pulse rounded-md bg-stone-200" />
              <div className="mt-3 h-6 w-3/4 animate-pulse rounded-md bg-stone-200" />
              <div className="mt-4 h-16 animate-pulse rounded-md bg-stone-100" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
