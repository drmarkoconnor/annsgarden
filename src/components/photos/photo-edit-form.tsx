import { updatePhoto } from "@/lib/photos/actions";
import type { PhotoFormOptions } from "@/lib/photos/data";
import type { GardenPhoto } from "@/types/garden";
import type { ReactNode } from "react";

type PhotoEditFormProps = {
  options: PhotoFormOptions;
  photo: GardenPhoto;
};

export function PhotoEditForm({ options, photo }: PhotoEditFormProps) {
  return (
    <form action={updatePhoto.bind(null, photo.id)} className="space-y-3">
      <label className="block text-sm font-medium text-stone-700">
        Caption
        <input
          name="caption"
          defaultValue={photo.caption}
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm font-medium text-stone-700">
          Taken
          <input
            name="taken_at"
            type="date"
            defaultValue={photo.takenAtValue}
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          />
        </label>
        <Select label="By" name="uploaded_by" defaultValue={photo.uploadedById ?? "none"}>
          <option value="none">No one selected</option>
          {options.profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </Select>
      </div>

      <Select label="Area" name="area_id" defaultValue={photo.areaId ?? "none"}>
        <option value="none">No area</option>
        {options.areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </Select>

      <details className="rounded-md border border-stone-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          More links
        </summary>
        <div className="mt-3 space-y-3">
          <Select label="Plant" name="plant_id" defaultValue={photo.plantId ?? "none"}>
            <option value="none">No plant</option>
            {options.plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </Select>

          <Select label="Task" name="task_instance_id" defaultValue={photo.taskId ?? "none"}>
            <option value="none">No task</option>
            {options.tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </Select>

          <Select
            label="Diary note"
            name="diary_entry_id"
            defaultValue={photo.diaryEntryId ?? "none"}
          >
            <option value="none">No diary note</option>
            {options.diaryEntries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </Select>
        </div>
      </details>

      <label className="block text-sm font-medium text-stone-700">
        Tags
        <input
          name="tags"
          defaultValue={photo.tags.join(", ")}
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        />
      </label>

      <details className="rounded-md border border-stone-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          Compare
        </summary>
        <div className="mt-3 space-y-3">
          <label className="block text-sm font-medium text-stone-700">
            Comparison group
            <input
              name="comparison_group_id"
              defaultValue={photo.comparisonGroupId}
              className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Same position note
            <textarea
              name="same_position_note"
              rows={2}
              defaultValue={photo.samePositionNote}
              className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
            />
          </label>
        </div>
      </details>

      <button
        type="submit"
        className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
      >
        Update photo
      </button>
    </form>
  );
}

function Select({
  children,
  label,
  name,
  defaultValue,
}: {
  children: ReactNode;
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
      >
        {children}
      </select>
    </label>
  );
}
