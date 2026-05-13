import { AppShell } from "@/components/app-shell";
import { PhotoPlaceholderCard } from "@/components/photo-placeholder-card";
import { getAreaName } from "@/data/areas";
import { getPlantName } from "@/data/plants";
import { photos } from "@/data/photos";

export default function PhotosPage() {
  const comparisonPhotos = photos.slice(0, 2);

  return (
    <AppShell activeItem="photos">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Timeline</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Photos</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Placeholders for garden photos, linked back to areas, plants and tasks.
          </p>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">Compare</h2>
            <p className="text-sm leading-6 text-stone-600">
              A static sketch of how side-by-side progress could feel.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {comparisonPhotos.map((photo) => (
              <PhotoPlaceholderCard
                key={photo.id}
                photo={photo}
                areaName={getAreaName(photo.areaId)}
                plantName={getPlantName(photo.plantId)}
                compact
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-950">Photo timeline</h2>
          <div className="space-y-3">
            {photos.map((photo) => (
              <PhotoPlaceholderCard
                key={photo.id}
                photo={photo}
                areaName={getAreaName(photo.areaId)}
                plantName={getPlantName(photo.plantId)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
