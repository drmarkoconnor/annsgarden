import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { PlantIdentificationForm } from "@/components/ai/plant-identification-form";
import { AreaCard } from "@/components/area-card";
import { DiaryEntryCard } from "@/components/diary-entry-card";
import { AreaForm } from "@/components/garden/area-form";
import { PlantForm } from "@/components/garden/plant-form";
import { PhotoPlaceholderCard } from "@/components/photo-placeholder-card";
import { PhotoForm } from "@/components/photos/photo-form";
import { PlantCard } from "@/components/plant-card";
import { TaskCard } from "@/components/task-card";
import { DiaryForm } from "@/components/diary/diary-form";
import { TaskForm } from "@/components/tasks/task-form";
import {
  createPlant,
  updateGardenArea,
} from "@/lib/garden/actions";
import { getAreaWorkspaceData } from "@/lib/garden/data";

export const dynamic = "force-dynamic";

type AreaWorkspaceSearchParams = {
  areaError?: string;
  diaryError?: string;
  photoError?: string;
  plantError?: string;
  saved?: string;
  taskError?: string;
};

export default async function AreaWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ areaId: string }>;
  searchParams?: Promise<AreaWorkspaceSearchParams>;
}) {
  const [{ areaId }, notices] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);
  const workspace = await getAreaWorkspaceData(areaId);

  if (!workspace) {
    notFound();
  }

  const {
    activeAreas,
    area,
    diaryEntries,
    diaryFormOptions,
    photoFormOptions,
    photos,
    plants,
    taskFormOptions,
    tasks,
  } = workspace;
  const returnTo = `/garden/areas/${area.id}`;
  const plantNameById = new Map(plants.map((plant) => [plant.id, plant.commonName]));
  const plantIdentificationOptions = {
    areas: activeAreas.map((item) => ({ id: item.id, name: item.name })),
    plants: plants.map((item) => ({ id: item.id, name: item.commonName })),
    profiles: photoFormOptions.profiles,
  };

  return (
    <AppShell activeItem="garden">
      <div className="space-y-6">
        <Link href="/garden" className="text-sm font-medium text-emerald-700">
          Back to garden
        </Link>

        <AreaWorkspaceNotice notices={notices} />

        <section>
          <p className="text-sm font-medium text-emerald-700">Area workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">{area.name}</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Add tasks, notes, plants and photos while keeping this area in context.
          </p>
        </section>

        <AreaCard area={area}>
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
              Edit area details
            </summary>
            <div className="mt-3">
              <AreaForm
                action={updateGardenArea.bind(null, area.id)}
                area={area}
                returnTo={returnTo}
                submitLabel="Update area"
              />
            </div>
          </details>
        </AreaCard>

        <section className="space-y-3">
          <SectionHeader title="Work in this area" meta="Quick add" />
          <div className="grid gap-3">
            <ActionPanel title="Add task">
              <TaskForm
                defaultAreaId={area.id}
                options={taskFormOptions}
                returnTo={returnTo}
              />
            </ActionPanel>
            <ActionPanel title="Add plant">
              <PlantForm
                action={createPlant}
                areas={activeAreas}
                defaultAreaId={area.id}
                returnTo={returnTo}
                submitLabel="Save plant"
              />
            </ActionPanel>
            <ActionPanel title="Add note">
              <DiaryForm
                defaultAreaId={area.id}
                options={diaryFormOptions}
                returnTo={returnTo}
              />
            </ActionPanel>
            <ActionPanel title="Add photo">
              <PhotoForm
                defaultAreaId={area.id}
                options={photoFormOptions}
                returnTo={returnTo}
              />
            </ActionPanel>
            <ActionPanel title="Identify plant">
              <PlantIdentificationForm
                defaultAreaId={area.id}
                options={plantIdentificationOptions}
              />
            </ActionPanel>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Open tasks" meta={`${tasks.length} shown`} />
          {tasks.length ? (
            <div className="grid gap-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  areaName={area.name}
                  plantName={task.plantId ? plantNameById.get(task.plantId) : undefined}
                  task={task}
                />
              ))}
            </div>
          ) : (
            <EmptyState text="No open tasks are linked to this area yet." />
          )}
        </section>

        <section className="space-y-3">
          <SectionHeader title="Plants" meta={`${plants.length} active`} />
          {plants.length ? (
            <div className="grid gap-3">
              {plants.map((plant) => (
                <PlantCard key={plant.id} areaName={area.name} plant={plant} />
              ))}
            </div>
          ) : (
            <EmptyState text="No plants are linked to this area yet." />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <SectionHeader title="Photos" meta={`${photos.length} recent`} />
            <Link
              className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700"
              href={`/photos?view=area&area=${area.id}`}
            >
              Gallery
            </Link>
          </div>
          {photos.length ? (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <PhotoPlaceholderCard key={photo.id} compact photo={photo} />
              ))}
            </div>
          ) : (
            <EmptyState text="No photos are linked to this area yet." />
          )}
        </section>

        <section className="space-y-3">
          <SectionHeader title="Recent notes" meta={`${diaryEntries.length} shown`} />
          {diaryEntries.length ? (
            <div className="grid gap-3">
              {diaryEntries.map((entry) => (
                <DiaryEntryCard key={entry.id} areaName={area.name} entry={entry} />
              ))}
            </div>
          ) : (
            <EmptyState text="No diary notes are linked to this area yet." />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function AreaWorkspaceNotice({
  notices,
}: {
  notices: AreaWorkspaceSearchParams;
}) {
  if (notices.saved === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Saved.
      </div>
    );
  }

  const message =
    notices.areaError === "duplicate"
      ? "That garden area already exists. Choose a different name."
      : notices.areaError || notices.diaryError || notices.photoError || notices.plantError || notices.taskError
        ? "That change could not be saved. Please check the details and try again."
        : null;

  return message ? (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      {message}
    </div>
  ) : null;
}

function ActionPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <details className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-stone-900">
        {title}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function SectionHeader({ meta, title }: { meta: string; title: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      <p className="text-sm font-medium text-stone-500">{meta}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
      {text}
    </div>
  );
}
