import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { AppShell } from "@/components/app-shell";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import {
  applyIdentificationToExistingPlant,
  applyIdentificationToNewPlant,
  discardPlantIdentification,
} from "@/lib/ai/plant-identification/actions";
import {
  getPlantIdentificationDetail,
  type PlantIdentificationFormOptions,
  type PlantIdentificationRecord,
} from "@/lib/ai/plant-identification/data";

export const dynamic = "force-dynamic";

type PlantIdentificationDetailSearchParams = {
  identifyError?: string;
  saved?: string;
};

export default async function PlantIdentificationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ identificationId: string }>;
  searchParams?: Promise<PlantIdentificationDetailSearchParams>;
}) {
  const [{ identificationId }, notices] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);
  const detail = await getPlantIdentificationDetail(identificationId);

  if (!detail) {
    notFound();
  }

  const { formOptions, identification } = detail;

  return (
    <AppShell activeItem="garden">
      <div className="space-y-6">
        <Link href="/garden/identify" className="text-sm font-medium text-emerald-700">
          Back to plant assist
        </Link>

        <PlantIdentificationNotice notices={notices} />

        <section>
          <p className="text-sm font-medium text-emerald-700">AI suggestion</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">
            {identification.commonName}
          </h1>
          {identification.latinName ? (
            <p className="mt-1 text-base italic leading-7 text-stone-600">
              {identification.latinName}
            </p>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          {identification.imageUrl ? (
            <div className="relative h-72 w-full">
              <Image
                alt={identification.commonName}
                className="object-cover"
                fill
                sizes="100vw"
                src={identification.imageUrl}
                unoptimized
              />
            </div>
          ) : null}
          <div className="p-4">
            <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-600">
              <Badge text={statusLabel(identification.status)} />
              <Badge text={confidenceLabel(identification.confidence)} />
              {identification.areaName ? <Badge text={identification.areaName} /> : null}
              {identification.plantName ? <Badge text={identification.plantName} /> : null}
            </div>
            {identification.confidenceNotes ? (
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {identification.confidenceNotes}
              </p>
            ) : null}
          </div>
        </section>

        <DetailSection title="Identification">
          <DetailRow label="Common name" value={identification.commonName} />
          <DetailRow label="Latin name" value={identification.latinName} />
          <DetailRow label="Genus" value={identification.genus} />
          <DetailRow label="Species" value={identification.species} />
          <DetailRow label="Cultivar" value={identification.cultivar} />
          <DetailRow label="Type" value={identification.plantType} />
        </DetailSection>

        {identification.identifyingFeatures.length ? (
          <DetailSection title="Visible features">
            <TagList items={identification.identifyingFeatures} />
          </DetailSection>
        ) : null}

        {identification.careSummary || identification.rhsNotes ? (
          <DetailSection title="Care notes">
            {identification.careSummary ? (
              <p className="text-sm leading-6 text-stone-600">
                {identification.careSummary}
              </p>
            ) : null}
            {identification.rhsNotes ? (
              <p className="text-sm leading-6 text-stone-600">
                {identification.rhsNotes}
              </p>
            ) : null}
          </DetailSection>
        ) : null}

        {identification.warnings.length ? (
          <DetailSection title="Cautions">
            <TagList items={identification.warnings} tone="amber" />
          </DetailSection>
        ) : null}

        {identification.rhsSources.length ? (
          <DetailSection title="Sources">
            <div className="space-y-2">
              {identification.rhsSources.map((source) => (
                <a
                  className="block rounded-md bg-stone-50 px-3 py-2 text-sm font-medium text-emerald-800"
                  href={source.url}
                  key={source.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.title}
                </a>
              ))}
            </div>
          </DetailSection>
        ) : null}

        {identification.status === "suggested" ? (
          <ApplySuggestionForms
            formOptions={formOptions}
            identification={identification}
          />
        ) : null}
      </div>
    </AppShell>
  );
}

function ApplySuggestionForms({
  formOptions,
  identification,
}: {
  formOptions: PlantIdentificationFormOptions;
  identification: PlantIdentificationRecord;
}) {
  const notes = suggestedNotes(identification);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-950">Apply suggestion</h2>

      <details className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
          Create new plant
        </summary>
        <form
          action={applyIdentificationToNewPlant.bind(null, identification.id)}
          className="mt-4 space-y-3"
        >
          <PlantFields
            areaId={identification.areaId}
            formOptions={formOptions}
            identification={identification}
            notes={notes}
          />
          <button
            className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            Create plant
          </button>
        </form>
      </details>

      <details className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          Update existing plant
        </summary>
        <form
          action={applyIdentificationToExistingPlant.bind(null, identification.id)}
          className="mt-4 space-y-3"
        >
          <Select
            label="Plant"
            name="plant_id"
            defaultValue={identification.plantId ?? ""}
            required
          >
            <option value="" disabled>
              Choose plant
            </option>
            {formOptions.plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </Select>
          <PlantFields
            areaId={identification.areaId}
            formOptions={formOptions}
            identification={identification}
            notes={notes}
          />
          <button
            className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            Update plant
          </button>
        </form>
      </details>

      <ConfirmActionForm
        action={discardPlantIdentification.bind(null, identification.id)}
        confirmLabel="Discard suggestion"
        confirmMessage="Discard this AI suggestion? The uploaded photo will stay in Photos."
      >
        <button
          className="w-full cursor-pointer rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700"
          type="submit"
        >
          Discard suggestion
        </button>
      </ConfirmActionForm>
    </section>
  );
}

function PlantFields({
  areaId,
  formOptions,
  identification,
  notes,
}: {
  areaId?: string;
  formOptions: PlantIdentificationFormOptions;
  identification: PlantIdentificationRecord;
  notes: string;
}) {
  return (
    <>
      <Field
        label="Common name"
        name="common_name"
        defaultValue={identification.commonName}
        required
      />
      <Field label="Latin name" name="latin_name" defaultValue={identification.latinName} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cultivar" name="cultivar" defaultValue={identification.cultivar} />
        <Field label="Plant type" name="plant_type" defaultValue={identification.plantType} />
      </div>
      <Select label="Area" name="primary_area_id" defaultValue={areaId ?? "none"}>
        <option value="none">No area</option>
        {formOptions.areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </Select>
      <TextArea label="Notes" name="general_notes" defaultValue={notes} rows={5} />
    </>
  );
}

function PlantIdentificationNotice({
  notices,
}: {
  notices: PlantIdentificationDetailSearchParams;
}) {
  if (notices.saved === "1") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Suggestion updated.
      </div>
    );
  }

  if (!notices.identifyError) {
    return null;
  }

  const messages: Record<string, string> = {
    "missing-plant": "Choose the existing plant you want to update.",
    "not-found": "That plant suggestion could not be found.",
    "save-failed": "The suggestion could not be updated. Please check the details and try again.",
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      {messages[notices.identifyError] ?? messages["save-failed"]}
    </div>
  );
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-3 border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
      <dt className="text-sm font-medium text-stone-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-stone-900">{value}</dd>
    </div>
  );
}

function TagList({ items, tone = "stone" }: { items: string[]; tone?: "amber" | "stone" }) {
  const className =
    tone === "amber"
      ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
      : "rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span className={className} key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
      {text}
    </span>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  type?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        name={name}
        type={type}
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        {...props}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  rows = 3,
  ...props
}: {
  label: string;
  name: string;
  rows?: number;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <textarea
        name={name}
        rows={rows}
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
        {...props}
      />
    </label>
  );
}

function Select({
  children,
  label,
  name,
  defaultValue,
  required = false,
}: {
  children: ReactNode;
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
      >
        {children}
      </select>
    </label>
  );
}

function suggestedNotes(identification: PlantIdentificationRecord) {
  return [
    identification.suggestedPlantNotes,
    identification.careSummary,
    identification.rhsNotes,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function statusLabel(status: PlantIdentificationRecord["status"]) {
  const labels: Record<PlantIdentificationRecord["status"], string> = {
    applied: "Applied",
    discarded: "Discarded",
    suggested: "Review needed",
  };

  return labels[status];
}

function confidenceLabel(confidence: PlantIdentificationRecord["confidence"]) {
  const labels: Record<PlantIdentificationRecord["confidence"], string> = {
    high: "High confidence",
    low: "Low confidence",
    medium: "Medium confidence",
    unknown: "Unknown confidence",
  };

  return labels[confidence];
}
