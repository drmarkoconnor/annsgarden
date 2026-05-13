import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PlantIdentificationCard } from "@/components/ai/plant-identification-card";
import { PlantIdentificationForm } from "@/components/ai/plant-identification-form";
import { getPlantIdentificationData } from "@/lib/ai/plant-identification/data";

export const dynamic = "force-dynamic";

type PlantIdentificationSearchParams = {
  identifyError?: string;
};

export default async function PlantIdentifyPage({
  searchParams,
}: {
  searchParams?: Promise<PlantIdentificationSearchParams>;
}) {
  const [notices, data] = await Promise.all([
    searchParams ?? Promise.resolve({}),
    getPlantIdentificationData(),
  ]);

  return (
    <AppShell activeItem="garden">
      <div className="space-y-6">
        <Link href="/garden" className="text-sm font-medium text-emerald-700">
          Back to garden
        </Link>

        <section>
          <p className="text-sm font-medium text-emerald-700">AI plant assist</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">
            Identify a plant
          </h1>
          <p className="mt-1 max-w-sm text-base leading-7 text-stone-600">
            Upload a plant photo, then review the suggestion before saving it.
          </p>
        </section>

        <PlantIdentifyNotice notices={notices} />

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <PlantIdentificationForm options={data.formOptions} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">Recent suggestions</h2>
            <span className="text-sm font-medium text-stone-500">
              {data.identifications.length}
            </span>
          </div>
          {data.identifications.length ? (
            <div className="grid gap-3">
              {data.identifications.map((identification) => (
                <PlantIdentificationCard
                  identification={identification}
                  key={identification.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState text="No plant suggestions yet." />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function PlantIdentifyNotice({
  notices,
}: {
  notices: PlantIdentificationSearchParams;
}) {
  if (!notices.identifyError) {
    return null;
  }

  const messages: Record<string, string> = {
    "ai-failed": "The AI suggestion could not be created. Please try another photo.",
    "file-too-large": "The photo is too large. Please use an image under 10 MB.",
    "missing-file": "Choose a plant photo first.",
    "save-failed": "The suggestion could not be saved.",
    "unsupported-type": "Use a JPEG, PNG, WebP, HEIC or HEIF image.",
    "upload-failed": "The photo could not be uploaded.",
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      {messages[notices.identifyError] ?? "The plant suggestion could not be created."}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
      {text}
    </div>
  );
}
