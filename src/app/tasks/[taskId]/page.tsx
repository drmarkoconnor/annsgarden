import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { getAreaName } from "@/data/areas";
import { getPlantName } from "@/data/plants";
import { getTask, tasks } from "@/data/tasks";

export function generateStaticParams() {
  return tasks.map((task) => ({
    taskId: task.id,
  }));
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = getTask(taskId);

  if (!task) {
    notFound();
  }

  const areaName = getAreaName(task.areaId);
  const plantName = getPlantName(task.plantId);

  return (
    <AppShell activeItem="tasks">
      <div className="space-y-6">
        <Link href="/" className="text-sm font-medium text-emerald-700">
          Back to tasks
        </Link>

        <section className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-stone-500">{task.category}</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-950">
                {task.title}
              </h1>
            </div>
            <TaskStatusBadge status={task.status} />
          </div>

          <p className="text-base leading-7 text-stone-600">{task.description}</p>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Why it matters</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {task.whyItMatters}
          </p>
        </section>

        <dl className="grid gap-3">
          <DetailRow label="Due" value={task.dueLabel} />
          <DetailRow label="Priority" value={task.priority} />
          {areaName ? <DetailRow label="Area" value={areaName} /> : null}
          {plantName ? <DetailRow label="Plant" value={plantName} /> : null}
          {task.assignedTo ? (
            <DetailRow label="Assigned to" value={task.assignedTo} />
          ) : null}
          {task.estimatedMinutes ? (
            <DetailRow label="Time" value={`${task.estimatedMinutes} minutes`} />
          ) : null}
        </dl>

        {task.toolsNeeded?.length ? (
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">Tools</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {task.toolsNeeded.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
                >
                  {tool}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Record outcome</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {["Done", "Part done", "Postpone", "Skip"].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700"
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-stone-900">{value}</dd>
    </div>
  );
}
