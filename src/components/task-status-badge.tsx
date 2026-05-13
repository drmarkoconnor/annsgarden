import type { TaskStatus } from "@/types/garden";

const statusStyles: Record<TaskStatus, string> = {
  not_started: "border-sky-200 bg-sky-50 text-sky-800",
  done: "border-emerald-200 bg-emerald-50 text-emerald-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  postponed: "border-stone-200 bg-stone-100 text-stone-700",
  skipped: "border-stone-200 bg-stone-50 text-stone-600",
  not_applicable: "border-stone-200 bg-stone-50 text-stone-600",
  overdue: "border-rose-200 bg-rose-50 text-rose-800",
};

const statusLabels: Record<TaskStatus, string> = {
  not_started: "Not started",
  done: "Done",
  partial: "Part done",
  postponed: "Postponed",
  skipped: "Skipped",
  not_applicable: "Not applicable",
  overdue: "Overdue",
};

type TaskStatusBadgeProps = {
  status: TaskStatus;
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
      ].join(" ")}
    >
      {statusLabels[status]}
    </span>
  );
}
