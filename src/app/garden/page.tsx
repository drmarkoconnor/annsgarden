import { AppShell } from "@/components/app-shell";
import type { ReactNode } from "react";
import { AreaCard } from "@/components/area-card";
import { PlantCard } from "@/components/plant-card";
import { AreaForm } from "@/components/garden/area-form";
import { PlantForm } from "@/components/garden/plant-form";
import {
  archiveGardenArea,
  archivePlant,
  createGardenArea,
  createPlant,
  restoreGardenArea,
  restorePlant,
  updateGardenArea,
  updatePlant,
} from "@/lib/garden/actions";
import { getGardenData } from "@/lib/garden/data";
import type { GardenAreaRecord, PlantRecord } from "@/lib/garden/data";

export const dynamic = "force-dynamic";

type GardenSearchParams = {
  areaError?: string;
  plantError?: string;
};

export default async function GardenPage({
  searchParams,
}: {
  searchParams?: Promise<GardenSearchParams>;
}) {
  const notices = searchParams ? await searchParams : {};
  const {
    garden,
    activeAreas,
    archivedAreas,
    activePlants,
    archivedPlants,
    areaNameById,
  } = await getGardenData();

  return (
    <AppShell activeItem="garden">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Live database</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Garden</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            {garden.name}, {garden.location_label}. Areas and plants now read
            from Supabase.
          </p>
        </section>

        <GardenNotice notices={notices} />

        <details className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
            Add garden area
          </summary>
          <div className="mt-4">
            <AreaForm action={createGardenArea} submitLabel="Save area" />
          </div>
        </details>

        <section className="space-y-3">
          <SectionHeader title="Areas" count={`${activeAreas.length} active`} />
          <div className="grid gap-3">
            {activeAreas.map((area) => (
              <AreaCard key={area.id} area={area}>
                <AreaControls area={area} />
              </AreaCard>
            ))}
          </div>
        </section>

        {archivedAreas.length ? (
          <ArchivedSection title="Archived areas">
            {archivedAreas.map((area) => (
              <ArchivedRow
                key={area.id}
                name={area.name}
                action={restoreGardenArea.bind(null, area.id)}
                actionLabel="Restore"
              />
            ))}
          </ArchivedSection>
        ) : null}

        <details className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
            Add plant
          </summary>
          <div className="mt-4">
            <PlantForm
              action={createPlant}
              areas={activeAreas}
              submitLabel="Save plant"
            />
          </div>
        </details>

        <section className="space-y-3">
          <SectionHeader title="Plants" count={`${activePlants.length} active`} />
          <div className="grid gap-3">
            {activePlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                areaName={plant.areaId ? areaNameById.get(plant.areaId) : undefined}
              >
                <PlantControls plant={plant} areas={activeAreas} />
              </PlantCard>
            ))}
          </div>
        </section>

        {archivedPlants.length ? (
          <ArchivedSection title="Archived plants">
            {archivedPlants.map((plant) => (
              <ArchivedRow
                key={plant.id}
                name={plant.commonName}
                action={restorePlant.bind(null, plant.id)}
                actionLabel="Restore"
              />
            ))}
          </ArchivedSection>
        ) : null}
      </div>
    </AppShell>
  );
}

function GardenNotice({ notices }: { notices: GardenSearchParams }) {
  const messages = [
    notices.areaError === "duplicate"
      ? "That garden area already exists. Edit the existing area, or choose a different name."
      : null,
    notices.areaError === "save-failed"
      ? "The area could not be saved. Please check the details and try again."
      : null,
    notices.plantError === "save-failed"
      ? "The plant could not be saved. Please check the details and try again."
      : null,
  ].filter(Boolean);

  if (!messages.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      <span className="text-sm font-medium text-stone-500">{count}</span>
    </div>
  );
}

function AreaControls({ area }: { area: GardenAreaRecord }) {
  return (
    <div className="space-y-3">
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
          Edit area
        </summary>
        <div className="mt-3">
          <AreaForm
            action={updateGardenArea.bind(null, area.id)}
            area={area}
            submitLabel="Update area"
          />
        </div>
      </details>
      <form action={archiveGardenArea.bind(null, area.id)}>
        <button
          type="submit"
          className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700"
        >
          Archive area
        </button>
      </form>
    </div>
  );
}

function PlantControls({
  plant,
  areas,
}: {
  plant: PlantRecord;
  areas: GardenAreaRecord[];
}) {
  return (
    <div className="space-y-3">
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
          Edit plant
        </summary>
        <div className="mt-3">
          <PlantForm
            action={updatePlant.bind(null, plant.id)}
            areas={areas}
            plant={plant}
            submitLabel="Update plant"
          />
        </div>
      </details>
      <form action={archivePlant.bind(null, plant.id)}>
        <button
          type="submit"
          className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700"
        >
          Archive plant
        </button>
      </form>
    </div>
  );
}

function ArchivedSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-stone-800">
        {title}
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

function ArchivedRow({
  name,
  action,
  actionLabel,
}: {
  name: string;
  action: (formData: FormData) => Promise<void>;
  actionLabel: string;
}) {
  return (
    <form
      action={action}
      className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2"
    >
      <span className="text-sm font-medium text-stone-700">{name}</span>
      <button type="submit" className="text-sm font-semibold text-emerald-700">
        {actionLabel}
      </button>
    </form>
  );
}
