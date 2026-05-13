import type { DiaryEntry } from "@/types/garden";

type DiaryEntryCardProps = {
  entry: DiaryEntry;
  areaName?: string;
  plantName?: string;
};

export function DiaryEntryCard({ entry, areaName, plantName }: DiaryEntryCardProps) {
  const displayAreaName = areaName ?? entry.areaName;
  const displayPlantName = plantName ?? entry.plantName;

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

      {entry.whatWentWell || entry.whatWentBadly || entry.whatToTryNext ? (
        <dl className="mt-4 space-y-2 rounded-md bg-stone-50 p-3 text-sm">
          {entry.whatWentWell ? (
            <div>
              <dt className="font-medium text-stone-700">Went well</dt>
              <dd className="mt-1 leading-6 text-stone-600">{entry.whatWentWell}</dd>
            </div>
          ) : null}
          {entry.whatWentBadly ? (
            <div>
              <dt className="font-medium text-stone-700">Went badly</dt>
              <dd className="mt-1 leading-6 text-stone-600">
                {entry.whatWentBadly}
              </dd>
            </div>
          ) : null}
          {entry.whatToTryNext ? (
            <div>
              <dt className="font-medium text-stone-700">Try next</dt>
              <dd className="mt-1 leading-6 text-stone-600">
                {entry.whatToTryNext}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        {displayAreaName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {displayAreaName}
          </span>
        ) : null}
        {displayPlantName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {displayPlantName}
          </span>
        ) : null}
        {entry.taskName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {entry.taskName}
          </span>
        ) : null}
        {entry.followUpTaskTitle ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
            Follow-up: {entry.followUpTaskTitle}
          </span>
        ) : entry.followUpNeeded ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
            Follow-up needed
          </span>
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
