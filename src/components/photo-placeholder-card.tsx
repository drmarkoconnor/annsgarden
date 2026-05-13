import Image from "next/image";
import type { ReactNode } from "react";
import type { GardenPhoto } from "@/types/garden";

type PlaceholderTone = NonNullable<GardenPhoto["placeholderTone"]>;

const toneStyles: Record<PlaceholderTone, string> = {
  leaf: "from-emerald-200 via-lime-100 to-stone-100",
  rose: "from-rose-200 via-pink-100 to-stone-100",
  shade: "from-slate-200 via-teal-100 to-stone-100",
  orchard: "from-amber-200 via-green-100 to-stone-100",
  soil: "from-stone-300 via-orange-100 to-stone-100",
};

type PhotoPlaceholderCardProps = {
  photo: GardenPhoto;
  areaName?: string;
  children?: ReactNode;
  plantName?: string;
  compact?: boolean;
};

export function PhotoPlaceholderCard({
  photo,
  areaName,
  children,
  plantName,
  compact = false,
}: PhotoPlaceholderCardProps) {
  const area = areaName ?? photo.areaName;
  const plant = plantName ?? photo.plantName;
  const tone: PlaceholderTone = photo.placeholderTone ?? "leaf";

  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      {photo.imageUrl ? (
        <div className={["relative w-full", compact ? "h-28" : "h-48"].join(" ")}>
          <Image
            alt={photo.caption}
            className="object-cover"
            fill
            sizes={compact ? "50vw" : "100vw"}
            src={photo.imageUrl}
            unoptimized
          />
        </div>
      ) : (
        <div
          className={[
            "flex items-end bg-gradient-to-br p-4",
            compact ? "h-28" : "h-40",
            toneStyles[tone],
          ].join(" ")}
        >
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-stone-700">
            Photo pending
          </span>
        </div>
      )}
      <div className="p-4">
        <p className="text-xs font-medium text-stone-500">
          {photo.takenAt} by {photo.uploadedBy}
        </p>
        <h3 className="mt-1 text-base font-semibold text-stone-950">
          {photo.caption}
        </h3>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
          {area ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">{area}</span>
          ) : null}
          {plant ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">{plant}</span>
          ) : null}
          {photo.taskName ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">
              {photo.taskName}
            </span>
          ) : null}
          {photo.diaryEntryTitle ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">
              {photo.diaryEntryTitle}
            </span>
          ) : null}
          {photo.comparisonGroupId ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
              {photo.comparisonGroupId}
            </span>
          ) : null}
          {photo.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-stone-100 px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
        {photo.samePositionNote ? (
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {photo.samePositionNote}
          </p>
        ) : null}
        {children ? (
          <div className="mt-4 border-t border-stone-100 pt-4">{children}</div>
        ) : null}
      </div>
    </article>
  );
}
