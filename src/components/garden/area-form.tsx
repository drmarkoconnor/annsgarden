import type { GardenAreaRecord } from "@/lib/garden/data";

type AreaFormProps = {
  action: (formData: FormData) => Promise<void>;
  area?: GardenAreaRecord;
  returnTo?: string;
  submitLabel: string;
};

export function AreaForm({ action, area, returnTo, submitLabel }: AreaFormProps) {
  return (
    <form action={action} className="space-y-3">
      {returnTo ? <input name="return_to" type="hidden" value={returnTo} /> : null}
      <Field label="Name" name="name" defaultValue={area?.name} required />
      <TextArea
        label="Description"
        name="description"
        defaultValue={area?.descriptionValue ?? undefined}
        rows={2}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Sunlight" name="sunlight" defaultValue={area?.sunlightValue ?? undefined} />
        <Field label="Soil" name="soil_type" defaultValue={area?.soilTypeValue ?? undefined} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Soil pH" name="soil_ph" defaultValue={area?.soilPhValue ?? undefined} />
        <Field label="Drainage" name="drainage" defaultValue={area?.drainageValue ?? undefined} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextArea
          label="Moisture notes"
          name="moisture_notes"
          defaultValue={area?.moistureNotesValue ?? undefined}
          rows={2}
        />
        <TextArea
          label="Microclimate notes"
          name="microclimate_notes"
          defaultValue={area?.microclimateNotesValue ?? undefined}
          rows={2}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Display order"
          name="display_order"
          type="number"
          defaultValue={area?.displayOrder.toString()}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: "text" | "number";
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-300"
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <textarea
        className="mt-1 w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm leading-6 text-stone-900 outline-none focus:border-emerald-300"
        name={name}
        defaultValue={defaultValue}
        rows={rows}
      />
    </label>
  );
}
