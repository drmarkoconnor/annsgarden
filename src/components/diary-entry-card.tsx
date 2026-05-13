import type { DiaryEntry } from "@/types/garden";

type DiaryEntryCardProps = {
  entry: DiaryEntry;
  areaName?: string;
  plantName?: string;
};

export function DiaryEntryCard({ entry, areaName, plantName }: DiaryEntryCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">
            {entry.entryDate} by {entry.createdBy}
          </p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {entry.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{entry.quickNote}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        {areaName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">{areaName}</span>
        ) : null}
        {plantName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">{plantName}</span>
        ) : null}
        {entry.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-stone-100 px-2.5 py-1">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
