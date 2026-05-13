import { AppShell } from "@/components/app-shell";
import { AreaCard } from "@/components/area-card";
import { PlantCard } from "@/components/plant-card";
import { areas, getAreaName } from "@/data/areas";
import { plants } from "@/data/plants";

export default function GardenPage() {
  return (
    <AppShell activeItem="garden">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Areas and plants</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Garden</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Ann&apos;s one-acre garden, split into the places she already knows.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">Areas</h2>
            <span className="text-sm font-medium text-stone-500">
              {areas.length} areas
            </span>
          </div>
          <div className="grid gap-3">
            {areas.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">Plants</h2>
            <span className="text-sm font-medium text-stone-500">
              {plants.length} records
            </span>
          </div>
          <div className="grid gap-3">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                areaName={getAreaName(plant.areaId)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
