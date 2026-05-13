import type { GardenTask } from "@/types/garden";

type TaskProgressSummaryProps = {
  tasks: GardenTask[];
};

export function TaskProgressSummary({ tasks }: TaskProgressSummaryProps) {
  const thisMonthCount = tasks.filter((task) => task.section === "this_month").length;
  const overdueCount = tasks.filter((task) => task.status === "overdue").length;
  const upcomingCount = tasks.filter((task) => task.section === "upcoming").length;
  const completedCount = tasks.filter((task) => task.section === "history").length;
  const totalCount = tasks.length;
  const progressLabel = `${completedCount}/${totalCount}`;

  const cards = [
    {
      title: "This month",
      value: thisMonthCount,
      description: "active jobs",
      accent: "bg-emerald-500",
    },
    {
      title: "Overdue",
      value: overdueCount,
      description: "need attention",
      accent: "bg-rose-500",
    },
    {
      title: "Upcoming",
      value: upcomingCount,
      description: "planned next",
      accent: "bg-sky-500",
    },
    {
      title: "Progress",
      value: progressLabel,
      description: "done this set",
      accent: "bg-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${card.accent}`} />
            <p className="text-xs font-medium text-stone-500">{card.title}</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-stone-950">
            {card.value}
          </p>
          <p className="text-xs text-stone-500">{card.description}</p>
        </article>
      ))}
    </div>
  );
}
