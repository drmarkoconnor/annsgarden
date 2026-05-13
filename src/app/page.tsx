import { AppShell } from "@/components/app-shell";
import { TaskSummaryCard } from "@/components/task-summary-card";

const taskSections = [
  {
    title: "This month's tasks",
    eyebrow: "May",
    description: "Seasonal jobs for the beds, pots, and greenhouse will appear here.",
    accent: "bg-emerald-500",
  },
  {
    title: "Overdue",
    eyebrow: "Needs attention",
    description: "Missed tasks will be kept visible until they are completed or moved.",
    accent: "bg-rose-500",
  },
  {
    title: "Upcoming",
    eyebrow: "Next few weeks",
    description: "Future garden jobs will be grouped here so Ann can plan ahead.",
    accent: "bg-sky-500",
  },
  {
    title: "Progress",
    eyebrow: "Snapshot",
    description: "A simple summary of completed and remaining tasks will live here.",
    accent: "bg-amber-500",
  },
];

export default function Home() {
  return (
    <AppShell activeItem="tasks">
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-700">
            Ann&apos;s Garden
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-stone-950">
                Tasks
              </h1>
              <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
                A quiet place for keeping the garden jobs visible and manageable.
              </p>
            </div>
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 sm:block">
              North Somerset
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {taskSections.map((section) => (
            <TaskSummaryCard key={section.title} {...section} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
