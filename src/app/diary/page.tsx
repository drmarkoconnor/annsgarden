import { AppShell } from "@/components/app-shell";
import { DiaryForm } from "@/components/diary/diary-form";
import { DiaryEntryCard } from "@/components/diary-entry-card";
import { getDiaryData } from "@/lib/diary/data";

export const dynamic = "force-dynamic";

type DiarySearchParams = {
  diaryError?: string;
  saved?: string;
};

export default async function DiaryPage({
  searchParams,
}: {
  searchParams?: Promise<DiarySearchParams>;
}) {
  const notices = searchParams ? await searchParams : {};
  const { entries, formOptions } = await getDiaryData();

  return (
    <AppShell activeItem="diary">
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-emerald-700">Notes</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Diary</h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Quick observations that help next month and next year.
          </p>
        </section>

        <DiaryNotice notices={notices} />

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <DiaryForm options={formOptions} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-950">Recent notes</h2>
          <div className="space-y-3">
            {entries.map((entry) => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function DiaryNotice({ notices }: { notices: DiarySearchParams }) {
  if (notices.saved === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Diary note saved.
      </div>
    );
  }

  if (notices.diaryError === "save-failed") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        The diary note could not be saved. Please check the details and try again.
      </div>
    );
  }

  return null;
}
