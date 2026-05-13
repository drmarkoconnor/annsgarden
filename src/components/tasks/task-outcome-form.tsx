import { recordTaskOutcome } from "@/lib/tasks/actions";
import type { TaskFormOptions, TaskRecord } from "@/lib/tasks/data";

type TaskOutcomeFormProps = {
  options: TaskFormOptions;
  task: TaskRecord;
};

export function TaskOutcomeForm({ options, task }: TaskOutcomeFormProps) {
  return (
    <form action={recordTaskOutcome.bind(null, task.instanceId)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-stone-700">
          Outcome
          <select
            name="status"
            defaultValue={task.storedStatus ?? task.status}
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          >
            <option value="done">Done</option>
            <option value="partial">Part done</option>
            <option value="postponed">Postponed</option>
            <option value="skipped">Skipped</option>
            <option value="not_applicable">Not applicable</option>
            <option value="not_started">Not started</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-stone-700">
          By
          <select
            name="completed_by"
            defaultValue="none"
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          >
            <option value="none">No one selected</option>
            {options.profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-stone-700">
          Minutes
          <input
            type="number"
            min="1"
            name="time_spent_minutes"
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Postpone to
          <input
            type="date"
            name="postponed_until"
            defaultValue={task.postponedUntil}
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-stone-700">
        Note
        <textarea
          name="note"
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          placeholder="Optional quick note"
        />
      </label>

      <label className="block text-sm font-medium text-stone-700">
        Skip reason
        <input
          name="skip_reason"
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          placeholder="Only if skipped"
        />
      </label>

      <label className="block text-sm font-medium text-stone-700">
        Postpone reason
        <input
          name="postpone_reason"
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          placeholder="Only if postponed"
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm"
      >
        Save outcome
      </button>
    </form>
  );
}
