import { createDiaryEntry } from "@/lib/diary/actions";
import type { DiaryFormOptions } from "@/lib/diary/data";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type DiaryFormProps = {
  options: DiaryFormOptions;
};

export function DiaryForm({ options }: DiaryFormProps) {
  return (
    <form action={createDiaryEntry} className="space-y-4">
      <label className="block text-sm font-semibold text-stone-950">
        Quick note
        <textarea
          name="quick_note"
          required
          rows={4}
          className="mt-3 w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-800 outline-none focus:border-emerald-300 focus:bg-white"
          placeholder="What did you notice in the garden?"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Date" name="entry_date" type="date" defaultValue={todayIsoDate()} />
        <Select label="By" name="created_by" defaultValue="none">
          <option value="none">No one selected</option>
          {options.profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </Select>
      </div>

      <Select label="Area" name="area_id" defaultValue="none">
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
          <Select label="Plant" name="plant_id" defaultValue="none">
            <option value="none">No plant</option>
            {options.plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </Select>

          <Select label="Task" name="task_instance_id" defaultValue="none">
            <option value="none">No task</option>
            {options.tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </Select>
        </div>
      </details>

      <details className="rounded-md border border-stone-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          Tags
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.tags.map((tag) => (
            <label
              key={tag.id}
              className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              <input name="tag_ids" type="checkbox" value={tag.id} />
              {tag.name}
            </label>
          ))}
        </div>
      </details>

      <details className="rounded-md border border-stone-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          Reflection
        </summary>
        <div className="mt-3 space-y-3">
          <Field label="Title" name="title" />
          <TextArea label="What went well" name="what_went_well" />
          <TextArea label="What went badly" name="what_went_badly" />
          <TextArea label="What to try next" name="what_to_try_next" />
        </div>
      </details>

      <details className="rounded-md border border-stone-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          Follow-up task
        </summary>
        <div className="mt-3 space-y-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-700">
            <input name="follow_up_needed" type="checkbox" />
            Follow-up needed
          </label>
          <Field label="Task title" name="follow_up_title" />
          <Field label="Reminder date" name="follow_up_date" type="date" />
          <TextArea label="Task note" name="follow_up_note" />
        </div>
      </details>

      <button
        type="submit"
        className="w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
      >
        Save note
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  type?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        name={name}
        type={type}
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        {...props}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <textarea
        name={name}
        rows={2}
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        {...props}
      />
    </label>
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

function todayIsoDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  }).formatToParts(new Date());
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "05";
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";

  return `${year}-${month}-${day}`;
}
