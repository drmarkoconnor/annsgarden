import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PestLogForm } from "@/components/pest-watch/pest-log-form";
import { getPestWatchData } from "@/lib/pest-watch/data";
import type {
  PestDiseaseIssue,
  PestDiseaseIssueType,
  PestDiseaseLog,
  PestDiseaseSeverity,
} from "@/types/garden";
import type { PestWatchTask } from "@/lib/pest-watch/data";

export const dynamic = "force-dynamic";

type PestWatchSearchParams = {
  pestError?: string;
  saved?: string;
};

export default async function PestWatchPage({
  searchParams,
}: {
  searchParams?: Promise<PestWatchSearchParams>;
}) {
  const notices = searchParams ? await searchParams : {};
  const {
    currentMonthIssues,
    currentMonthName,
    formOptions,
    issues,
    recentLogs,
    watchTasks,
  } = await getPestWatchData();

  return (
    <AppShell activeItem="more">
      <div className="space-y-6">
        <section>
          <Link
            className="text-sm font-semibold text-emerald-700"
            href="/more"
          >
            More
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">
            Pest & disease watch
          </h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Seasonal checks, short notes and organic-first guidance for Ann&apos;s
            garden.
          </p>
        </section>

        <PestWatchNotice notices={notices} />

        <section className="space-y-3">
          <SectionHeader
            count={currentMonthIssues.length}
            title={`Watch in ${currentMonthName}`}
          />
          <div className="grid gap-3">
            {currentMonthIssues.slice(0, 4).map((issue) => (
              <IssueSummaryCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>

        <details className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
            Add observation
          </summary>
          <div className="mt-4 rounded-lg border border-emerald-100 bg-white p-4">
            <PestLogForm options={formOptions} />
          </div>
        </details>

        <section className="space-y-3">
          <SectionHeader title="Recent observations" count={recentLogs.length} />
          {recentLogs.length ? (
            <div className="grid gap-3">
              {recentLogs.map((log) => (
                <ObservationCard key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <EmptyState text="No pest or disease observations yet." />
          )}
        </section>

        <section className="space-y-3">
          <SectionHeader title="Inspection tasks" count={watchTasks.length} />
          {watchTasks.length ? (
            <div className="grid gap-3">
              {watchTasks.map((task) => (
                <WatchTaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState text="No pest-watch inspection tasks are set up yet." />
          )}
        </section>

        <section className="space-y-3">
          <SectionHeader title="Issue list" count={issues.length} />
          <div className="grid gap-3">
            {issues.map((issue) => (
              <IssueDetailCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function PestWatchNotice({ notices }: { notices: PestWatchSearchParams }) {
  if (notices.saved === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Observation saved.
      </div>
    );
  }

  if (!notices.pestError) {
    return null;
  }

  const messages: Record<string, string> = {
    "missing-issue": "Choose an issue before saving.",
    "save-failed": "The observation could not be saved.",
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      {messages[notices.pestError] ?? messages["save-failed"]}
    </div>
  );
}

function SectionHeader({ count, title }: { count: number; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      <span className="text-sm font-medium text-stone-500">{count}</span>
    </div>
  );
}

function IssueSummaryCard({ issue }: { issue: PestDiseaseIssue }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">
            {formatIssueType(issue.issueType)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {issue.name}
          </h3>
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{issue.symptoms}</p>
      <p className="mt-3 text-sm leading-6 text-stone-700">
        {issue.organicTreatmentNote}
      </p>
    </article>
  );
}

function ObservationCard({ log }: { log: PestDiseaseLog }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">
            {log.observedAt}
          </p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {log.issueName}
          </h3>
        </div>
        <SeverityBadge severity={log.severity} />
      </div>
      {log.note ? (
        <p className="mt-3 text-sm leading-6 text-stone-600">{log.note}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        {log.areaName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {log.areaName}
          </span>
        ) : null}
        {log.plantName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {log.plantName}
          </span>
        ) : null}
        {log.observedBy ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {log.observedBy}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function WatchTaskCard({ task }: { task: PestWatchTask }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">{task.dueLabel}</p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {task.title}
          </h3>
        </div>
        <SeverityBadge severity={task.priority} />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{task.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
        {task.areaName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {task.areaName}
          </span>
        ) : null}
        {task.plantName ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-1">
            {task.plantName}
          </span>
        ) : null}
      </div>
    </>
  );

  if (task.href) {
    return (
      <Link
        className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
        href={task.href}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      {content}
    </article>
  );
}

function IssueDetailCard({ issue }: { issue: PestDiseaseIssue }) {
  return (
    <details className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer">
        <span className="flex items-start justify-between gap-3">
          <span>
            <span className="block text-xs font-medium text-stone-500">
              {formatIssueType(issue.issueType)}
            </span>
            <span className="mt-1 block text-base font-semibold text-stone-950">
              {issue.name}
            </span>
          </span>
          <SeverityBadge severity={issue.severity} />
        </span>
      </summary>
      <div className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
        <p>{issue.description}</p>
        <Fact label="Symptoms" value={issue.symptoms} />
        <Fact label="Likely months" value={formatMonths(issue.likelyMonths)} />
        <Fact label="Watch on" value={issue.affectedPlants} />
        <Fact label="Prevention" value={issue.preventionNote} />
        <Fact label="Organic-first note" value={issue.organicTreatmentNote} />
        <Fact label="Chemical caution" value={issue.chemicalCautionNote} />
        <Fact label="Seek help" value={issue.whenToSeekHelp} />
        {issue.externalUrl ? (
          <a
            className="inline-flex text-sm font-semibold text-emerald-800"
            href={issue.externalUrl}
          >
            External guidance
          </a>
        ) : (
          <p className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-500">
            External guidance placeholder
          </p>
        )}
      </div>
    </details>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold text-stone-800">{label}: </span>
      {value}
    </p>
  );
}

function SeverityBadge({ severity }: { severity: PestDiseaseSeverity }) {
  const styles: Record<PestDiseaseSeverity, string> = {
    high: "bg-rose-50 text-rose-700",
    low: "bg-stone-100 text-stone-600",
    medium: "bg-amber-50 text-amber-800",
    unknown: "bg-stone-100 text-stone-600",
  };

  return (
    <span
      className={[
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[severity],
      ].join(" ")}
    >
      {formatSeverity(severity)}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
      {text}
    </div>
  );
}

function formatIssueType(value: PestDiseaseIssueType) {
  const labels: Record<PestDiseaseIssueType, string> = {
    animal: "Animal activity",
    disease: "Disease",
    pest: "Pest",
    unknown: "Watch item",
  };

  return labels[value];
}

function formatSeverity(value: PestDiseaseSeverity) {
  const labels: Record<PestDiseaseSeverity, string> = {
    high: "High",
    low: "Low",
    medium: "Medium",
    unknown: "Unknown",
  };

  return labels[value];
}

function formatMonths(months: number[]) {
  if (!months.length) {
    return "No months recorded";
  }

  return months.map((month) => monthName(month)).join(", ");
}

function monthName(month: number) {
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(
    new Date(Date.UTC(2026, month - 1, 1)),
  );
}
