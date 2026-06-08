import { AppShell } from "@/components/app-shell";
import { GardenMapExplorer } from "@/components/garden/garden-map-explorer";
import { normaliseGardenMapZone } from "@/lib/garden/map-data";

export const dynamic = "force-dynamic";

type GardenMapSearchParams = {
  zone?: string;
};

export default async function GardenMapPage({
  searchParams,
}: {
  searchParams?: Promise<GardenMapSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedZone = normaliseGardenMapZone(params.zone);

  return (
    <AppShell activeItem="garden">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Garden</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Map</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            A first pass from the Old Rectory topographic survey, split into
            current named garden areas.
          </p>
        </section>

        <GardenMapExplorer selectedZone={selectedZone} />
      </div>
    </AppShell>
  );
}
