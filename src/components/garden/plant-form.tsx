"use client";

import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { useLocalFormDraft } from "@/components/forms/use-local-form-draft";
import type { GardenAreaRecord, PlantRecord } from "@/lib/garden/data";
import { useState } from "react";

type PlantFormProps = {
  action: (formData: FormData) => Promise<void>;
  clearDraft?: boolean;
  areas: GardenAreaRecord[];
  defaultAreaId?: string;
  plant?: PlantRecord;
  returnTo?: string;
  submitLabel: string;
};

export function PlantForm({
  action,
  clearDraft = false,
  areas,
  defaultAreaId,
  plant,
  returnTo,
  submitLabel,
}: PlantFormProps) {
  const areaId = plant?.areaId ?? defaultAreaId;
  const draftKey = [
    "plant",
    returnTo ?? "root",
    defaultAreaId ?? "none",
    plant?.id ?? "new",
  ].join(":");
  const [isUnknown, setIsUnknown] = useState(Boolean(plant?.isUnknown));
  const formRef = useLocalFormDraft(draftKey, clearDraft);

  return (
    <form action={action} className="space-y-3" ref={formRef}>
      {returnTo ? <input name="return_to" type="hidden" value={returnTo} /> : null}
      <Field
        label="Plant name"
        name="common_name"
        defaultValue={plant?.commonName}
        placeholder="Rose by patio, unknown shrub, or leave blank if unknown"
        required={!isUnknown}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Latin name" name="latin_name" defaultValue={plant?.latinName} />
        <Field label="Cultivar" name="cultivar" defaultValue={plant?.cultivar} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Plant type" name="plant_type" defaultValue={plant?.plantType} />
        <AreaSelect areas={areas} defaultValue={areaId} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <HealthSelect defaultValue={plant?.healthStatus} />
        <StatusSelect defaultValue={plant?.status} />
      </div>
      <TextArea
        label="Notes"
        name="general_notes"
        defaultValue={plant?.generalNotesValue ?? undefined}
      />
      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input
          className="h-4 w-4 rounded border-stone-300 text-emerald-700"
          name="is_unknown"
          type="checkbox"
          checked={isUnknown}
          onChange={(event) => setIsUnknown(event.currentTarget.checked)}
        />
        Mark as unknown plant
      </label>
      <FormSubmitButton
        className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
        pendingLabel="Saving plant..."
      >
        {submitLabel}
      </FormSubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-300"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function AreaSelect({
  areas,
  defaultValue,
}: {
  areas: GardenAreaRecord[];
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      Area
      <select
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-300"
        name="primary_area_id"
        defaultValue={defaultValue ?? ""}
      >
        <option value="">No area yet</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function HealthSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      Health
      <select
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-300"
        name="health_status"
        defaultValue={defaultValue ?? "unknown"}
      >
        <option value="thriving">Thriving</option>
        <option value="okay">Okay</option>
        <option value="needs_attention">Needs attention</option>
        <option value="struggling">Struggling</option>
        <option value="unknown">Unknown</option>
      </select>
    </label>
  );
}

function StatusSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      Status
      <select
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-300"
        name="status"
        defaultValue={defaultValue ?? "active"}
      >
        <option value="active">Active</option>
        <option value="removed">Removed</option>
        <option value="dead">Dead</option>
        <option value="unknown">Unknown</option>
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <textarea
        className="mt-1 w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm leading-6 text-stone-900 outline-none focus:border-emerald-300"
        name={name}
        defaultValue={defaultValue}
        rows={3}
      />
    </label>
  );
}
