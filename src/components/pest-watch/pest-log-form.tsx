import { createPestDiseaseLog } from "@/lib/pest-watch/actions";
import type { PestWatchFormOptions } from "@/lib/pest-watch/data";
import type { ReactNode } from "react";

type PestLogFormProps = {
  options: PestWatchFormOptions;
};

export function PestLogForm({ options }: PestLogFormProps) {
  return (
    <form action={createPestDiseaseLog} className="space-y-4">
      <Select label="Issue" name="issue_id" required>
        <option value="">Choose issue</option>
        {options.issues.map((issue) => (
          <option key={issue.id} value={issue.id}>
            {issue.name}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-stone-700">
          Date seen
          <input
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
            defaultValue={todayIsoDate()}
            name="observed_at"
            type="date"
          />
        </label>
        <Select label="Severity" name="severity" defaultValue="unknown">
          <option value="unknown">Unknown</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Area" name="area_id" defaultValue="none">
          <option value="none">No area</option>
          {options.areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </Select>
        <Select label="Plant" name="plant_id" defaultValue="none">
          <option value="none">No plant</option>
          {options.plants.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </Select>
      </div>

      <Select label="Seen by" name="observed_by" defaultValue="none">
        <option value="none">No one selected</option>
        {options.profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </Select>

      <label className="block text-sm font-medium text-stone-700">
        Note
        <textarea
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          name="note"
          placeholder="What did you see?"
          rows={3}
        />
      </label>

      <button
        className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
        type="submit"
      >
        Save observation
      </button>
    </form>
  );
}

function Select({
  children,
  defaultValue,
  label,
  name,
  required = false,
}: {
  children: ReactNode;
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <select
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        defaultValue={defaultValue}
        name={name}
        required={required}
      >
        {children}
      </select>
    </label>
  );
}

function todayIsoDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  }).formatToParts(new Date());

  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";

  return `${year}-${month}-${day}`;
}
