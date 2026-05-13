import Link from "next/link";
import { TaskStatusBadge } from "@/components/task-status-badge";
import type { GardenTask } from "@/types/garden";

type TaskCardProps = {
  task: GardenTask;
  areaName?: string;
  plantName?: string;
};

export function TaskCard({ task, areaName, plantName }: TaskCardProps) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">{task.category}</p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {task.title}
          </h3>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{task.description}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        <span className="rounded-full bg-stone-100 px-2.5 py-1">{task.dueLabel}</span>
        {areaName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">{areaName}</span>
        ) : null}
        {plantName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">{plantName}</span>
        ) : null}
      </div>
    </Link>
  );
}
