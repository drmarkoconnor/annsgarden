type TaskSummaryCardProps = {
  title: string;
  eyebrow: string;
  description: string;
  accent: string;
};

export function TaskSummaryCard({
  title,
  eyebrow,
  description,
  accent,
}: TaskSummaryCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-normal text-stone-500">
          {eyebrow}
        </p>
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-normal text-stone-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </article>
  );
}
