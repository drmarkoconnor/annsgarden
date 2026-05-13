import { AppShell } from "@/components/app-shell";
import { DiaryEntryCard } from "@/components/diary-entry-card";
import { getAreaName } from "@/data/areas";
import { diaryEntries } from "@/data/diary-entries";
import { getPlantName } from "@/data/plants";

export default function DiaryPage() {
  return (
    <AppShell activeItem="diary">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Notes</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Diary</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Quick observations that help next month and next year.
          </p>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <label
            htmlFor="quick-note"
            className="text-sm font-semibold text-stone-950"
          >
            Quick note
          </label>
          <textarea
            id="quick-note"
            rows={4}
            className="mt-3 w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
            placeholder="What did you notice in the garden?"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              aria-label="Optional area"
              className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
              defaultValue=""
            >
              <option value="">Area</option>
              <option>South-facing borders</option>
              <option>Shady borders under trees</option>
              <option>Orchard area, lower field</option>
            </select>
            <button
              type="button"
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
            >
              Save note
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-950">Recent notes</h2>
          <div className="space-y-3">
            {diaryEntries.map((entry) => (
              <DiaryEntryCard
                key={entry.id}
                entry={entry}
                areaName={getAreaName(entry.areaId)}
                plantName={getPlantName(entry.plantId)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
