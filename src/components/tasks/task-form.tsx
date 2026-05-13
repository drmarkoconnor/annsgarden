import { createTask } from "@/lib/tasks/actions";
import type { TaskFormOptions } from "@/lib/tasks/data";
import type { InputHTMLAttributes, ReactNode } from "react";

type TaskFormProps = {
  options: TaskFormOptions;
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function TaskForm({ options }: TaskFormProps) {
  return (
    <form action={createTask} className="space-y-4">
      <Field label="Task title" name="title" required />

      <label className="block text-sm font-medium text-stone-700">
        Short description
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          placeholder="A practical note about the job"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Month" name="month" defaultValue={String(currentMonth())}>
          {months.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </Select>
        <Select label="Window" name="timing_window" defaultValue="all_month">
          <option value="early_month">Early</option>
          <option value="mid_month">Mid</option>
          <option value="late_month">Late</option>
          <option value="all_month">All month</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Priority" name="priority" defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <Field label="Minutes" name="estimated_minutes" type="number" min="1" />
      </div>

      <Select label="Category" name="category_id" defaultValue="none">
        <option value="none">No category</option>
        {options.categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

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

      <Select label="Assigned to" name="assigned_to" defaultValue="none">
        <option value="none">No one yet</option>
        {options.profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </Select>

      <Field
        label="Tools"
        name="tools_needed"
        placeholder="Secateurs, gloves"
      />

      <label className="block text-sm font-medium text-stone-700">
        Why it matters
        <textarea
          name="why_it_matters"
          rows={2}
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          placeholder="Optional short context"
        />
      </label>

      <Select label="Created by" name="created_by" defaultValue="none">
        <option value="none">No one selected</option>
        {options.profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </Select>

      <button
        type="submit"
        className="w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm"
      >
        Save task
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

function currentMonth() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    month: "2-digit",
    timeZone: "Europe/London",
  }).formatToParts(new Date());

  return Number(parts.find((part) => part.type === "month")?.value ?? "5");
}
