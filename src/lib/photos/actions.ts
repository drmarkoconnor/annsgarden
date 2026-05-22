"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSignedIn } from "@/lib/auth/guards";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { pathWithParam, safeReturnPath } from "@/lib/navigation/return-path";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import { defaultProfileIdForClaims } from "@/lib/profiles/default-profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type PhotoInsert = Database["public"]["Tables"]["photos"]["Insert"];
type PhotoUpdate = Database["public"]["Tables"]["photos"]["Update"];

const maxUploadBytes = 10 * 1024 * 1024;
const maxThumbnailBytes = 1024 * 1024;
const supportedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function createPhoto(formData: FormData) {
  const claims = await requireSignedIn();
  const returnTo = safeReturnPath(optionalText(formData, "return_to"), "/photos");
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    redirect(pathWithParam(returnTo, "photoError", "missing-file"));
  }

  if (file.size > maxUploadBytes) {
    redirect(pathWithParam(returnTo, "photoError", "file-too-large"));
  }

  if (file.type && !supportedTypes.has(file.type)) {
    redirect(pathWithParam(returnTo, "photoError", "unsupported-type"));
  }

  const supabase = createSupabaseAdminClient();
  const defaultProfileId = await defaultProfileIdForClaims(supabase, claims);
  const storagePath = storagePathFor(file);
  const thumbnail = optionalImageFile(formData, "thumbnail");
  const thumbnailStoragePath = thumbnail ? thumbnailPathFor(thumbnail) : null;
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, bytes, {
      cacheControl: "31536000",
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    redirect(pathWithParam(returnTo, "photoError", "upload-failed"));
  }

  let uploadedThumbnailPath: string | null = null;

  if (thumbnail && thumbnailStoragePath) {
    const thumbnailBytes = await thumbnail.arrayBuffer();
    const { error: thumbnailUploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(thumbnailStoragePath, thumbnailBytes, {
        cacheControl: "31536000",
        contentType: thumbnail.type || "image/jpeg",
        upsert: false,
      });

    if (!thumbnailUploadError) {
      uploadedThumbnailPath = thumbnailStoragePath;
    }
  }

  const payload: PhotoInsert = {
    garden_id: ANN_GARDEN_ID,
    uploaded_by: optionalUuid(formData, "uploaded_by") ?? defaultProfileId,
    storage_path: storagePath,
    original_storage_path: storagePath,
    thumbnail_path: uploadedThumbnailPath,
    caption: optionalText(formData, "caption"),
    taken_at: optionalText(formData, "taken_at") ?? todayIsoDate(),
    area_id: optionalUuid(formData, "area_id"),
    plant_id: optionalUuid(formData, "plant_id"),
    task_instance_id: optionalUuid(formData, "task_instance_id"),
    diary_entry_id: optionalUuid(formData, "diary_entry_id"),
    tags: optionalList(formData, "tags") ?? [],
    same_position_note: optionalText(formData, "same_position_note"),
    comparison_group_id: optionalText(formData, "comparison_group_id"),
  };
  const { error: insertError } = await supabase.from("photos").insert(payload);

  if (insertError) {
    await supabase.storage
      .from(PHOTO_BUCKET)
      .remove([storagePath, uploadedThumbnailPath].filter(Boolean) as string[]);
    redirect(pathWithParam(returnTo, "photoError", "save-failed"));
  }

  revalidatePath("/photos");
  revalidatePath("/garden");
  revalidatePath(returnTo);
  redirect(pathWithParam(returnTo, "saved", "photo"));
}

export async function updatePhoto(photoId: string, formData: FormData) {
  await requireSignedIn();
  const payload: PhotoUpdate = {
    area_id: optionalUuid(formData, "area_id"),
    caption: optionalText(formData, "caption"),
    comparison_group_id: optionalText(formData, "comparison_group_id"),
    diary_entry_id: optionalUuid(formData, "diary_entry_id"),
    plant_id: optionalUuid(formData, "plant_id"),
    same_position_note: optionalText(formData, "same_position_note"),
    tags: optionalList(formData, "tags") ?? [],
    taken_at: optionalText(formData, "taken_at") ?? todayIsoDate(),
    task_instance_id: optionalUuid(formData, "task_instance_id"),
    uploaded_by: optionalUuid(formData, "uploaded_by"),
  };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("photos")
    .update(payload)
    .eq("id", photoId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    redirect("/photos?photoError=save-failed");
  }

  revalidatePath("/photos");
  redirect("/photos?saved=1");
}

export async function deletePhoto(photoId: string) {
  await requireSignedIn();
  const supabase = createSupabaseAdminClient();
  const { data: photo, error: readError } = await supabase
    .from("photos")
    .select("storage_path, thumbnail_path")
    .eq("id", photoId)
    .eq("garden_id", ANN_GARDEN_ID)
    .single();

  if (readError) {
    redirect("/photos?photoError=delete-failed");
  }

  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (deleteError) {
    redirect("/photos?photoError=delete-failed");
  }

  const storagePaths = [photo.storage_path, photo.thumbnail_path].filter(
    Boolean,
  ) as string[];

  if (storagePaths.length) {
    await supabase.storage.from(PHOTO_BUCKET).remove(storagePaths);
  }

  revalidatePath("/photos");
  redirect("/photos?deleted=1");
}

function storagePathFor(file: File) {
  const extension = fileExtension(file);
  const parts = todayParts();
  return `${ANN_GARDEN_ID}/${parts.year}/${crypto.randomUUID()}.${extension}`;
}

function thumbnailPathFor(file: File) {
  const extension = fileExtension(file);
  const parts = todayParts();
  return `${ANN_GARDEN_ID}/${parts.year}/thumbs/${crypto.randomUUID()}.${extension}`;
}

function fileExtension(file: File) {
  const byType: Record<string, string> = {
    "image/heic": "heic",
    "image/heif": "heif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  if (file.type && byType[file.type]) {
    return byType[file.type];
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension?.replace(/[^a-z0-9]/g, "") || "jpg";
}

function optionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function optionalUuid(formData: FormData, key: string) {
  const value = optionalText(formData, key);
  return value === "none" ? null : value;
}

function optionalImageFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value.type.startsWith("image/") && value.size <= maxThumbnailBytes
    ? value
    : null;
}

function optionalList(formData: FormData, key: string) {
  const value = optionalText(formData, key);

  if (!value) {
    return null;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function todayIsoDate() {
  const parts = todayParts();
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function todayParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  }).formatToParts(new Date());

  return {
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    year: Number(parts.find((part) => part.type === "year")?.value ?? "2026"),
  };
}
