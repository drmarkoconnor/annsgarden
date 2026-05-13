import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { TaskOutcomeForm } from "@/components/tasks/task-outcome-form";
import { getTaskDetail } from "@/lib/tasks/data";
import type { TaskCompletionRecord } from "@/lib/tasks/data";
import type { TaskStatus } from "@/types/garden";

export const dynamic = "force-dynamic";

type TaskDetailSearchParams = {
  saved?: string;
  taskError?: string;
};

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>;
  searchParams?: Promise<TaskDetailSearchParams>;
}) {
  const [{ taskId }, notices] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);
  const detail = await getTaskDetail(taskId);

  if (!detail) {
    notFound();
  }

  const { formOptions, task } = detail;

  return (
    <AppShell activeItem="tasks">
      <div className="space-y-6">
        <Link href="/" className="text-sm font-medium text-emerald-700">
          Back to tasks
        </Link>

        <TaskNotice notices={notices} />

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
          <DetailRow label="Priority" value={formatPriority(task.priority)} />
          {task.areaName ? <DetailRow label="Area" value={task.areaName} /> : null}
          {task.plantName ? <DetailRow label="Plant" value={task.plantName} /> : null}
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

        <TaskWarnings
          safetyWarning={task.safetyWarning}
          weatherWarning={task.weatherWarning}
          wildlifeWarning={task.wildlifeWarning}
        />

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Record outcome</h2>
          <div className="mt-4">
            <TaskOutcomeForm options={formOptions} task={task} />
          </div>
        </section>

        {task.completions.length ? (
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">History</h2>
            <div className="mt-3 space-y-3">
              {task.completions.map((completion) => (
                <CompletionRow key={completion.id} completion={completion} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

function TaskNotice({ notices }: { notices: TaskDetailSearchParams }) {
  if (notices.saved === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Task outcome saved.
      </div>
    );
  }

  if (notices.taskError === "save-failed") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        The task outcome could not be saved. Please check the details and try again.
      </div>
    );
  }

  return null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-stone-900">{value}</dd>
    </div>
  );
}

function TaskWarnings({
  safetyWarning,
  weatherWarning,
  wildlifeWarning,
}: {
  safetyWarning?: string;
  weatherWarning?: string;
  wildlifeWarning?: string;
}) {
  const warnings = [
    safetyWarning ? ["Safety", safetyWarning] : null,
    weatherWarning ? ["Weather", weatherWarning] : null,
    wildlifeWarning ? ["Wildlife", wildlifeWarning] : null,
  ].filter((item): item is string[] => Boolean(item));

  if (!warnings.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-lg font-semibold text-amber-950">Notes</h2>
      <div className="mt-3 space-y-2">
        {warnings.map(([label, value]) => (
          <p key={label} className="text-sm leading-6 text-amber-900">
            <span className="font-semibold">{label}:</span> {value}
          </p>
        ))}
      </div>
    </section>
  );
}

function CompletionRow({ completion }: { completion: TaskCompletionRecord }) {
  return (
    <article className="rounded-md bg-stone-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-900">
          {statusLabel(completion.status)}
        </p>
        <p className="text-xs font-medium text-stone-500">
          {formatDate(completion.completedAt)}
        </p>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        {completion.completedBy ? `By ${completion.completedBy}` : "No person selected"}
        {completion.timeSpentMinutes
          ? `, ${completion.timeSpentMinutes} minutes`
          : ""}
      </p>
      {completion.note ? (
        <p className="mt-2 text-sm leading-6 text-stone-600">{completion.note}</p>
      ) : null}
      {completion.skipReason ? (
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Skip reason: {completion.skipReason}
        </p>
      ) : null}
      {completion.postponeReason ? (
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Postpone reason: {completion.postponeReason}
        </p>
      ) : null}
    </article>
  );
}

function statusLabel(status: TaskStatus) {
  const labels: Record<TaskStatus, string> = {
    not_started: "Not started",
    done: "Done",
    partial: "Part done",
    postponed: "Postponed",
    skipped: "Skipped",
    not_applicable: "Not applicable",
    overdue: "Overdue",
  };

  return labels[status];
}

function formatPriority(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}
