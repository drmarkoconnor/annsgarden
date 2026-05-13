import Image from "next/image";
import type { ReactNode } from "react";
import type { GardenArea, GardenOrientationPhoto } from "@/types/garden";

type AreaCardProps = {
  area: GardenArea;
  children?: ReactNode;
};

export function AreaCard({ area, children }: AreaCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(7.5rem,46%)] gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-stone-950">{area.name}</h3>
          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            {area.plantCount} plants
          </span>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {area.description}
          </p>
        </div>
        <OrientationThumbnail
          label={`${area.name} orientation photo`}
          photo={area.orientationPhoto}
          tone="area"
        />
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="font-medium text-stone-700">Light</dt>
          <dd className="text-stone-600">{area.sunlight}</dd>
        </div>
        <div>
          <dt className="font-medium text-stone-700">Soil</dt>
          <dd className="text-stone-600">{area.soil}</dd>
        </div>
      </dl>
      {children ? <div className="mt-4 border-t border-stone-100 pt-4">{children}</div> : null}
    </article>
  );
}

function OrientationThumbnail({
  label,
  photo,
  tone,
}: {
  label: string;
  photo?: GardenOrientationPhoto;
  tone: "area" | "plant";
}) {
  const placeholderStyles = {
    area: "from-emerald-100 via-lime-50 to-stone-100",
    plant: "from-rose-100 via-emerald-50 to-stone-100",
  };

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
        <div
          className={[
            "flex h-full min-h-28 items-end bg-gradient-to-br p-3",
            placeholderStyles[tone],
          ].join(" ")}
        >
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-stone-700">
            Photo pending
          </span>
        </div>
      )}
    </div>
  );
}
