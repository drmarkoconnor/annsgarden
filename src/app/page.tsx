import { AppShell } from "@/components/app-shell";
import { TaskCard } from "@/components/task-card";
import { TaskProgressSummary } from "@/components/task-progress-summary";
import { TaskForm } from "@/components/tasks/task-form";
import { getTaskDashboardData } from "@/lib/tasks/data";
import type { TaskRecord } from "@/lib/tasks/data";

export const dynamic = "force-dynamic";

type TaskSearchParams = {
  taskError?: string;
};

function TaskSection({
  title,
  description,
  tasks,
}: {
  title: string;
  description: string;
  tasks: TaskRecord[];
}) {
  if (!tasks.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
        <p className="text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            areaName={task.areaName}
            plantName={task.plantName}
          />
        ))}
      </div>
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<TaskSearchParams>;
}) {
  const notices = searchParams ? await searchParams : {};
  const {
    allTasks,
    overdueTasks,
    thisMonthTasks,
    upcomingTasks,
    historyTasks,
    formOptions,
  } = await getTaskDashboardData();

  return (
    <AppShell activeItem="tasks">
      <div className="space-y-6">
        <section className="space-y-3">
          <p className="text-sm font-medium text-emerald-700">Ann&apos;s Garden</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-stone-950">Tasks</h1>
              <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
                What needs doing now in the actual garden.
              </p>
            </div>
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 sm:block">
              North Somerset
            </div>
          </div>
        </section>

        <TaskNotice notices={notices} />

        <TaskProgressSummary tasks={allTasks} />

        <details className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
            Add task
          </summary>
          <div className="mt-4">
            <TaskForm options={formOptions} />
          </div>
        </details>

        <TaskSection
          title="Overdue"
          description="Still visible until Ann, Mark or Alicia record a decision."
          tasks={overdueTasks}
        />

        <TaskSection
          title="This month's tasks"
          description="Current jobs from the live database, grouped into calm, practical reminders."
          tasks={thisMonthTasks}
        />

        <TaskSection
          title="Upcoming"
          description="Planned jobs that should stay in view without becoming noisy."
          tasks={upcomingTasks}
        />

        <TaskSection
          title="Recently recorded"
          description="Completed or dismissed jobs stay here as history."
          tasks={historyTasks}
        />
      </div>
    </AppShell>
  );
}

function TaskNotice({ notices }: { notices: TaskSearchParams }) {
  if (notices.taskError !== "save-failed") {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      The task could not be saved. Please check the details and try again.
    </div>
  );
}
