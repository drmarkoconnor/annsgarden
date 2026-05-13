"use client";

import { createPhoto } from "@/lib/photos/actions";
import type { PhotoFormOptions } from "@/lib/photos/data";
import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

type PhotoFormProps = {
  options: PhotoFormOptions;
};

const targetUploadBytes = 900 * 1024;
const resizeEdges = [1600, 1400, 1200];
const resizeQualities = [0.84, 0.76, 0.68, 0.6];

export function PhotoForm({ options }: PhotoFormProps) {
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);

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

    if (!file || !file.type.startsWith("image/") || file.size <= targetUploadBytes) {
      return;
    }

    event.preventDefault();
    setPhotoStatus("Preparing photo...");

    try {
      const resized = await resizePhoto(file);

      if (resized && resized.size < file.size) {
        const transfer = new DataTransfer();
        transfer.items.add(resized);
        input.files = transfer.files;
      }

      form.dataset.photoReady = "true";
      form.requestSubmit();
    } catch {
      setPhotoStatus("Photo could not be reduced. Sending the original.");
      form.dataset.photoReady = "true";
      form.requestSubmit();
    }
  }

  return (
    <form action={createPhoto} className="space-y-4" onSubmit={handleSubmit}>
      <Field label="Photo" name="photo" type="file" accept="image/*" required />
      {photoStatus ? (
        <p className="text-sm leading-6 text-stone-600">{photoStatus}</p>
      ) : null}
      <Field label="Caption" name="caption" />

      <div className="grid grid-cols-2 gap-2">
        <Field label="Taken" name="taken_at" type="date" defaultValue={todayIsoDate()} />
        <Select label="By" name="uploaded_by" defaultValue="none">
          <option value="none">No one selected</option>
          {options.profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </Select>
      </div>

      <Select label="Area" name="area_id" defaultValue="none">
        <option value="none">No area</option>
        {options.areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </Select>

      <details className="rounded-md border border-stone-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          More links
        </summary>
        <div className="mt-3 space-y-3">
          <Select label="Plant" name="plant_id" defaultValue="none">
            <option value="none">No plant</option>
            {options.plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </Select>

          <Select label="Task" name="task_instance_id" defaultValue="none">
            <option value="none">No task</option>
            {options.tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </Select>

          <Select label="Diary note" name="diary_entry_id" defaultValue="none">
            <option value="none">No diary note</option>
            {options.diaryEntries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </Select>
        </div>
      </details>

      <details className="rounded-md border border-stone-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          Compare
        </summary>
        <div className="mt-3 space-y-3">
          <Field label="Comparison group" name="comparison_group_id" />
          <TextArea label="Same position note" name="same_position_note" />
        </div>
      </details>

      <Field label="Tags" name="tags" placeholder="flowering, border gap" />

      <button
        type="submit"
        className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
      >
        Save photo
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
        rows={2}
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

function todayIsoDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  }).formatToParts(new Date());
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "05";
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";

  return `${year}-${month}-${day}`;
}

async function resizePhoto(file: File) {
  const image = await loadImage(file);
  let bestBlob: Blob | null = null;

  for (const edge of resizeEdges) {
    const canvas = drawImageToCanvas(image, edge);

    for (const quality of resizeQualities) {
      const blob = await canvasToBlob(canvas, "image/jpeg", quality);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }

      if (blob.size <= targetUploadBytes) {
        return blobToFile(blob, file);
      }
    }
  }

  return bestBlob && bestBlob.size < file.size ? blobToFile(bestBlob, file) : null;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    image.src = url;
  });
}

function drawImageToCanvas(image: HTMLImageElement, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not resize image."));
        }
      },
      type,
      quality,
    );
  });
}

function blobToFile(blob: Blob, originalFile: File) {
  const baseName = originalFile.name.replace(/\.[^.]+$/, "") || "garden-photo";
  return new File([blob], `${baseName}.jpg`, {
    lastModified: Date.now(),
    type: "image/jpeg",
  });
}
