import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { recordTaskOutcome } from "@/lib/tasks/actions";
import type { TaskRecord } from "@/lib/tasks/data";
import type { TaskStatus } from "@/types/garden";

type QuickTaskOutcomeFormProps = {
  task: TaskRecord;
};

const quickActions: Array<{
  label: string;
  pendingLabel: string;
  status: TaskStatus;
  className: string;
}> = [
  {
    label: "Done",
    pendingLabel: "Saving done...",
    status: "done",
    className: "bg-emerald-700 text-white",
  },
  {
    label: "Part done",
    pendingLabel: "Saving...",
    status: "partial",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    label: "Next week",
    pendingLabel: "Postponing...",
    status: "postponed",
    className: "border border-sky-200 bg-sky-50 text-sky-800",
  },
  {
    label: "Not needed",
    pendingLabel: "Saving...",
    status: "not_applicable",
    className: "border border-stone-200 bg-stone-50 text-stone-700",
  },
];

export function QuickTaskOutcomeForm({ task }: QuickTaskOutcomeFormProps) {
  const nextWeek = dateDaysFromNow(7);

  return (
    <div className="grid grid-cols-2 gap-2">
      {quickActions.map((action) => (
        <form action={recordTaskOutcome.bind(null, task.instanceId)} key={action.status}>
          <input name="status" type="hidden" value={action.status} />
          {action.status === "postponed" ? (
            <>
              <input name="postponed_until" type="hidden" value={nextWeek} />
              <input
                name="postpone_reason"
                type="hidden"
                value="Quick postponed while walking the garden."
              />
            </>
          ) : null}
          <FormSubmitButton
            className={[
              "min-h-12 w-full cursor-pointer rounded-md px-3 py-2 text-sm font-semibold shadow-sm disabled:cursor-wait disabled:opacity-70",
              action.className,
            ].join(" ")}
            pendingLabel={action.pendingLabel}
          >
            {action.label}
          </FormSubmitButton>
        </form>
      ))}
    </div>
  );
}

function dateDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";

  return `${year}-${month}-${day}`;
}
