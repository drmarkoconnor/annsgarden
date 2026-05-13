"use client";

import { requestPlantIdentification } from "@/lib/ai/plant-identification/actions";
import type { PlantIdentificationFormOptions } from "@/lib/ai/plant-identification/data";
import { resizeImageFile, targetUploadBytes } from "@/lib/photos/client-resize";
import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

type PlantIdentificationFormProps = {
  defaultAreaId?: string;
  defaultPlantId?: string;
  options: PlantIdentificationFormOptions;
};

export function PlantIdentificationForm({
  defaultAreaId,
  defaultPlantId,
  options,
}: PlantIdentificationFormProps) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;

    if (form.dataset.photoReady === "true") {
      delete form.dataset.photoReady;
      return;
    }

    const input = form.elements.namedItem("photo");

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const file = input.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    event.preventDefault();
    setStatus("Preparing photo...");

    try {
      const resized = await resizeImageFile(file, {
        forceJpeg: true,
        targetBytes: targetUploadBytes,
      });

      if (resized) {
        const transfer = new DataTransfer();
        transfer.items.add(resized);
        input.files = transfer.files;
      }

      setStatus("Asking AI...");
      form.dataset.photoReady = "true";
      form.requestSubmit();
    } catch {
      setStatus("Photo could not be reduced. Sending the original.");
      form.dataset.photoReady = "true";
      form.requestSubmit();
    }
  }

  return (
    <form action={requestPlantIdentification} className="space-y-4" onSubmit={handleSubmit}>
      <Field label="Photo" name="photo" type="file" accept="image/*" required />
      {status ? <p className="text-sm leading-6 text-stone-600">{status}</p> : null}

      <Select label="Area" name="area_id" defaultValue={defaultAreaId ?? "none"}>
        <option value="none">No area</option>
        {options.areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </Select>

      <Select label="Known plant" name="plant_id" defaultValue={defaultPlantId ?? "none"}>
        <option value="none">No plant yet</option>
        {options.plants.map((plant) => (
          <option key={plant.id} value={plant.id}>
            {plant.name}
          </option>
        ))}
      </Select>

      <Select label="By" name="requested_by" defaultValue="none">
        <option value="none">No one selected</option>
        {options.profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </Select>

      <TextArea
        label="Context"
        name="note"
        placeholder="Leaf, flower, height, where it is growing"
      />

      <button
        type="submit"
        className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
      >
        Identify plant
      </button>
    </form>
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
  ...props
}: {
  label: string;
  name: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <textarea
        name={name}
        rows={3}
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
}: {
  children: ReactNode;
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
      >
        {children}
      </select>
    </label>
  );
}
