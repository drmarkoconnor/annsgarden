import { AppShell } from "@/components/app-shell";
import { TaskCard } from "@/components/task-card";
import { TaskProgressSummary } from "@/components/task-progress-summary";
import { getAreaName } from "@/data/areas";
import { getPlantName } from "@/data/plants";
import { tasks } from "@/data/tasks";
import type { GardenTask } from "@/types/garden";

function TaskSection({
  title,
  description,
  tasks,
}: {
  title: string;
  description: string;
  tasks: GardenTask[];
}) {
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
            areaName={getAreaName(task.areaId)}
            plantName={getPlantName(task.plantId)}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const thisMonthTasks = tasks.filter((task) => task.section === "this_month");
  const overdueTasks = tasks.filter((task) => task.section === "overdue");
  const upcomingTasks = tasks.filter((task) => task.section === "upcoming");

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

        <TaskProgressSummary tasks={tasks} />

        <TaskSection
          title="This month's tasks"
          description="Current jobs for May, grouped into calm, practical reminders."
          tasks={thisMonthTasks}
        />

        <TaskSection
          title="Overdue"
          description="Still visible until Ann, Mark or Alicia record a decision."
          tasks={overdueTasks}
        />

        <TaskSection
          title="Upcoming"
          description="Planned jobs that should stay in view without becoming noisy."
          tasks={upcomingTasks}
        />
      </div>
    </AppShell>
  );
}
