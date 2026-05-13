import Link from "next/link";
import type { ReactNode } from "react";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { PhotoPlaceholderCard } from "@/components/photo-placeholder-card";
import { PhotoEditForm } from "@/components/photos/photo-edit-form";
import { deletePhoto } from "@/lib/photos/actions";
import type { PhotoFormOptions } from "@/lib/photos/data";
import type { GardenPhoto } from "@/types/garden";

type PhotoGalleryView = "timeline" | "area" | "plant";

export type PhotoFilterParams = {
  area?: string;
  plant?: string;
  q?: string;
  view?: string;
};

type PhotoFilters = {
  areaId: string;
  plantId: string;
  query: string;
  view: PhotoGalleryView;
};

export function normalisePhotoFilters(params: PhotoFilterParams): PhotoFilters {
  const view =
    params.view === "area" || params.view === "plant" ? params.view : "timeline";

  return {
    areaId: params.area ?? "all",
    plantId: params.plant ?? "all",
    query: params.q?.trim() ?? "",
    view,
  };
}

export function photoMatchesFilters(photo: GardenPhoto, filters: PhotoFilters) {
  if (filters.areaId !== "all" && photo.areaId !== filters.areaId) {
    return false;
  }

  if (filters.plantId !== "all" && photo.plantId !== filters.plantId) {
    return false;
  }

  if (!filters.query) {
    return true;
  }

  const searchText = [
    photo.areaName,
    photo.caption,
    photo.diaryEntryTitle,
    photo.plantName,
    photo.samePositionNote,
    photo.taskName,
    photo.takenAt,
    photo.uploadedBy,
    ...photo.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchText.includes(filters.query.toLowerCase());
}

export function PhotoGalleryFilters({
  filters,
  options,
  shownCount,
  totalCount,
}: {
  filters: PhotoFilters;
  options: PhotoFormOptions;
  shownCount: number;
  totalCount: number;
}) {
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {(["timeline", "area", "plant"] as const).map((view) => (
          <Link
            key={view}
            className={[
              "rounded-md px-3 py-2 text-center text-sm font-semibold",
              filters.view === view
                ? "bg-emerald-700 text-white"
                : "border border-stone-200 bg-white text-stone-700",
            ].join(" ")}
            href={galleryHref(filters, view)}
          >
            {viewLabel(view)}
          </Link>
        ))}
      </div>

      <form className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <input name="view" type="hidden" value={filters.view} />
        <div className="space-y-3">
          <label className="block text-sm font-medium text-stone-700">
            Search photos
            <input
              className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
              defaultValue={filters.query}
              name="q"
              placeholder="caption, tag, area or plant"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <SelectFilter label="Area" name="area" value={filters.areaId}>
              <option value="all">All areas</option>
              {options.areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </SelectFilter>
            <SelectFilter label="Plant" name="plant" value={filters.plantId}>
              <option value="all">All plants</option>
              {options.plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </SelectFilter>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-stone-500">
              Showing {shownCount} of {totalCount}
            </p>
            <div className="flex gap-2">
              <Link
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700"
                href="/photos"
              >
                Clear
              </Link>
              <button
                className="cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                type="submit"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

export function PhotoGallery({
  filters,
  options,
  photos,
}: {
  filters: PhotoFilters;
  options: PhotoFormOptions;
  photos: GardenPhoto[];
}) {
  if (!photos.length) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-950">Gallery</h2>
        <EmptyState text="No photos match those filters." />
      </section>
    );
  }

  if (filters.view === "area") {
    return (
      <GroupedPhotoGallery
        groups={groupPhotos(photos, (photo) => photo.areaName ?? "No area")}
        options={options}
        title="Photos by area"
      />
    );
  }

  if (filters.view === "plant") {
    return (
      <GroupedPhotoGallery
        groups={groupPhotos(photos, (photo) => photo.plantName ?? "No plant")}
        options={options}
        title="Photos by plant"
      />
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-950">Photo timeline</h2>
      <div className="space-y-3">
        {photos.map((photo) => (
          <PhotoPlaceholderCard key={photo.id} photo={photo}>
            <PhotoControls photo={photo} options={options} />
          </PhotoPlaceholderCard>
        ))}
      </div>
    </section>
  );
}

function SelectFilter({
  children,
  label,
  name,
  value,
}: {
  children: ReactNode;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <select
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        defaultValue={value}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

function GroupedPhotoGallery({
  groups,
  options,
  title,
}: {
  groups: Map<string, GardenPhoto[]>;
  options: PhotoFormOptions;
  title: string;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      {Array.from(groups).map(([groupName, photos]) => (
        <div key={groupName} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-stone-900">{groupName}</h3>
            <span className="text-sm font-medium text-stone-500">
              {photos.length}
            </span>
          </div>
          <div className="space-y-3">
            {photos.map((photo) => (
              <PhotoPlaceholderCard key={photo.id} photo={photo}>
                <PhotoControls photo={photo} options={options} />
              </PhotoPlaceholderCard>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function PhotoControls({
  options,
  photo,
}: {
  options: PhotoFormOptions;
  photo: GardenPhoto;
}) {
  return (
    <div className="space-y-3">
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
          Edit photo
        </summary>
        <div className="mt-3">
          <PhotoEditForm options={options} photo={photo} />
        </div>
      </details>

      <ConfirmActionForm
        action={deletePhoto.bind(null, photo.id)}
        confirmLabel="Delete photo"
        confirmMessage="Delete this photo? This removes it from the timeline and storage."
      >
        <button
          type="submit"
          className="w-full cursor-pointer rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          Delete photo
        </button>
      </ConfirmActionForm>
    </div>
  );
}

function galleryHref(filters: PhotoFilters, view: PhotoGalleryView) {
  const params = new URLSearchParams();

  if (view !== "timeline") {
    params.set("view", view);
  }

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.areaId !== "all") {
    params.set("area", filters.areaId);
  }

  if (filters.plantId !== "all") {
    params.set("plant", filters.plantId);
  }

  const query = params.toString();
  return query ? `/photos?${query}` : "/photos";
}

function groupPhotos(
  photos: GardenPhoto[],
  getGroupName: (photo: GardenPhoto) => string,
) {
  return photos.reduce((groups, photo) => {
    const groupName = getGroupName(photo);
    const group = groups.get(groupName) ?? [];
    group.push(photo);
    groups.set(groupName, group);
    return groups;
  }, new Map<string, GardenPhoto[]>());
}

function viewLabel(view: PhotoGalleryView) {
  const labels: Record<PhotoGalleryView, string> = {
    area: "Area",
    plant: "Plant",
    timeline: "Timeline",
  };

  return labels[view];
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
      {text}
    </div>
  );
}
