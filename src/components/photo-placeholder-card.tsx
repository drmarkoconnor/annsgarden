import type { GardenPhoto } from "@/types/garden";

const toneStyles: Record<GardenPhoto["placeholderTone"], string> = {
  leaf: "from-emerald-200 via-lime-100 to-stone-100",
  rose: "from-rose-200 via-pink-100 to-stone-100",
  shade: "from-slate-200 via-teal-100 to-stone-100",
  orchard: "from-amber-200 via-green-100 to-stone-100",
  soil: "from-stone-300 via-orange-100 to-stone-100",
};

type PhotoPlaceholderCardProps = {
  photo: GardenPhoto;
  areaName?: string;
  plantName?: string;
  compact?: boolean;
};

export function PhotoPlaceholderCard({
  photo,
  areaName,
  plantName,
  compact = false,
}: PhotoPlaceholderCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div
        className={[
          "flex items-end bg-gradient-to-br p-4",
          compact ? "h-28" : "h-40",
          toneStyles[photo.placeholderTone],
        ].join(" ")}
      >
        <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-stone-700">
          Photo placeholder
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-stone-500">
          {photo.takenAt} by {photo.uploadedBy}
        </p>
        <h3 className="mt-1 text-base font-semibold text-stone-950">
          {photo.caption}
        </h3>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
          {areaName ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">{areaName}</span>
          ) : null}
          {plantName ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-1">{plantName}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
