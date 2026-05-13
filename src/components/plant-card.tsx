import Image from "next/image";
import type { ReactNode } from "react";
import { HealthStatusBadge } from "@/components/health-status-badge";
import type { GardenOrientationPhoto, Plant } from "@/types/garden";

type PlantCardProps = {
  plant: Plant;
  areaName?: string;
  children?: ReactNode;
};

export function PlantCard({ plant, areaName, children }: PlantCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(7.5rem,46%)] gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-stone-500">{plant.plantType}</p>
            <HealthStatusBadge status={plant.healthStatus} />
          </div>
          <h3 className="mt-2 text-base font-semibold text-stone-950">
            {plant.commonName}
          </h3>
          {plant.latinName ? (
            <p className="mt-1 text-sm italic text-stone-500">{plant.latinName}</p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-stone-600">{plant.notes}</p>
        </div>
        <OrientationThumbnail
          label={`${plant.commonName} orientation photo`}
          photo={plant.orientationPhoto}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        {areaName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">{areaName}</span>
        ) : null}
        {plant.floweringPeriod ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            Flowers {plant.floweringPeriod}
          </span>
        ) : null}
        {plant.isUnknown ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">Unknown ID</span>
        ) : null}
      </div>
      {children ? <div className="mt-4 border-t border-stone-100 pt-4">{children}</div> : null}
    </article>
  );
}

function OrientationThumbnail({
  label,
  photo,
}: {
  label: string;
  photo?: GardenOrientationPhoto;
}) {
  return (
    <div
      aria-label={label}
      className="relative min-h-28 overflow-hidden rounded-md border border-stone-200 bg-stone-100"
    >
      {photo ? (
        <Image
          alt={photo.caption}
          className="object-cover"
          fill
          sizes="46vw"
          src={photo.imageUrl}
          unoptimized
        />
      ) : (
        <div className="flex h-full min-h-28 items-end bg-gradient-to-br from-rose-100 via-emerald-50 to-stone-100 p-3">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-stone-700">
            Photo pending
          </span>
        </div>
      )}
    </div>
  );
}
