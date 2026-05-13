"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSignedIn } from "@/lib/auth/guards";
import { identifyPlantFromImage } from "@/lib/ai/plant-identification/openai";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";

type PhotoInsert = Database["public"]["Tables"]["photos"]["Insert"];
type PlantInsert = Database["public"]["Tables"]["plants"]["Insert"];
type PlantUpdate = Database["public"]["Tables"]["plants"]["Update"];
type PlantIdentificationInsert =
  Database["public"]["Tables"]["plant_identifications"]["Insert"];
type PlantIdentificationUpdate =
  Database["public"]["Tables"]["plant_identifications"]["Update"];

const maxUploadBytes = 10 * 1024 * 1024;
const supportedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function requestPlantIdentification(formData: FormData) {
  await requireSignedIn();
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/garden/identify?identifyError=missing-file");
  }

  if (file.size > maxUploadBytes) {
    redirect("/garden/identify?identifyError=file-too-large");
  }

  if (file.type && !supportedTypes.has(file.type)) {
    redirect("/garden/identify?identifyError=unsupported-type");
  }

  const supabase = createSupabaseAdminClient();
  const areaId = optionalUuid(formData, "area_id");
  const plantId = optionalUuid(formData, "plant_id");
  const requestedBy = optionalUuid(formData, "requested_by");
  const areaName = areaId ? await getAreaName(areaId) : undefined;
  const bytes = await file.arrayBuffer();
  const identification = await identifyPlantFromImage({
    areaName,
    imageDataUrl: dataUrlFor(file, bytes),
    note: optionalText(formData, "note") ?? undefined,
  }).catch((error) => {
    console.error(error);
    redirect("/garden/identify?identifyError=ai-failed");
  });
  const storagePath = storagePathFor(file);
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    redirect("/garden/identify?identifyError=upload-failed");
  }

  const photoPayload: PhotoInsert = {
    area_id: areaId,
    caption: `AI plant ID: ${identification.result.commonName || "Unknown plant"}`,
    garden_id: ANN_GARDEN_ID,
    original_storage_path: storagePath,
    plant_id: plantId,
    storage_path: storagePath,
    tags: ["ai identification"],
    taken_at: todayIsoDate(),
    uploaded_by: requestedBy,
  };
  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .insert(photoPayload)
    .select("id")
    .single();

  if (photoError) {
    await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    redirect("/garden/identify?identifyError=save-failed");
  }

  const payload: PlantIdentificationInsert = {
    area_id: areaId,
    care_summary: emptyToNull(identification.result.careSummary),
    common_name: emptyToNull(identification.result.commonName),
    confidence: identification.result.confidence,
    confidence_notes: emptyToNull(identification.result.confidenceNotes),
    cultivar: emptyToNull(identification.result.cultivar),
    garden_id: ANN_GARDEN_ID,
    genus: emptyToNull(identification.result.genus),
    identifying_features: identification.result.identifyingFeatures,
    image_storage_path: storagePath,
    latin_name: emptyToNull(identification.result.latinName),
    model: identification.model,
    original_filename: file.name || null,
    photo_id: photo.id,
    plant_id: plantId,
    plant_type: emptyToNull(identification.result.plantType),
    raw_result: identification.raw as Json,
    requested_by: requestedBy,
    rhs_notes: emptyToNull(identification.result.rhsNotes),
    rhs_sources: identification.result.rhsSources as Json,
    species: emptyToNull(identification.result.species),
    suggested_plant_notes: emptyToNull(identification.result.suggestedPlantNotes),
    warnings: identification.result.warnings,
  };
  const { data: savedIdentification, error: identificationError } = await supabase
    .from("plant_identifications")
    .insert(payload)
    .select("id")
    .single();

  if (identificationError) {
    await supabase.from("photos").delete().eq("id", photo.id).eq("garden_id", ANN_GARDEN_ID);
    await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    redirect("/garden/identify?identifyError=save-failed");
  }

  revalidatePath("/garden");
  revalidatePath("/garden/identify");
  if (areaId) {
    revalidatePath(`/garden/areas/${areaId}`);
  }
  redirect(`/garden/identify/${savedIdentification.id}?saved=1`);
}

export async function applyIdentificationToNewPlant(
  identificationId: string,
  formData: FormData,
) {
  await requireSignedIn();
  const supabase = createSupabaseAdminClient();
  const identification = await getIdentification(identificationId);
  const areaId = optionalUuid(formData, "primary_area_id") ?? identification.area_id;
  const payload: PlantInsert = {
    common_name: requiredText(formData, "common_name"),
    cultivar: optionalText(formData, "cultivar"),
    garden_id: ANN_GARDEN_ID,
    general_notes: optionalText(formData, "general_notes"),
    health_status: "unknown",
    is_unknown: false,
    latin_name: optionalText(formData, "latin_name"),
    plant_type: optionalText(formData, "plant_type"),
    primary_area_id: areaId,
    status: "active",
  };
  const { data: plant, error: plantError } = await supabase
    .from("plants")
    .insert(payload)
    .select("id")
    .single();

  if (plantError) {
    redirect(`/garden/identify/${identificationId}?identifyError=save-failed`);
  }

  await markIdentificationApplied(identificationId, plant.id, identification.photo_id);
  revalidatePlantIdentificationPaths(identificationId, areaId ?? undefined);
  redirect(`/garden/identify/${identificationId}?saved=1`);
}

export async function applyIdentificationToExistingPlant(
  identificationId: string,
  formData: FormData,
) {
  await requireSignedIn();
  const plantId = requiredText(formData, "plant_id");
  const supabase = createSupabaseAdminClient();
  const identification = await getIdentification(identificationId);
  const areaId = optionalUuid(formData, "primary_area_id") ?? identification.area_id;
  const payload: PlantUpdate = {
    common_name: requiredText(formData, "common_name"),
    cultivar: optionalText(formData, "cultivar"),
    general_notes: optionalText(formData, "general_notes"),
    latin_name: optionalText(formData, "latin_name"),
    plant_type: optionalText(formData, "plant_type"),
    primary_area_id: areaId,
    status: "active",
  };
  const { error } = await supabase
    .from("plants")
    .update(payload)
    .eq("id", plantId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    redirect(`/garden/identify/${identificationId}?identifyError=save-failed`);
  }

  await markIdentificationApplied(identificationId, plantId, identification.photo_id);
  revalidatePlantIdentificationPaths(identificationId, areaId ?? undefined);
  redirect(`/garden/identify/${identificationId}?saved=1`);
}

export async function discardPlantIdentification(identificationId: string) {
  await requireSignedIn();
  const update: PlantIdentificationUpdate = {
    status: "discarded",
  };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("plant_identifications")
    .update(update)
    .eq("id", identificationId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    redirect(`/garden/identify/${identificationId}?identifyError=save-failed`);
  }

  revalidatePlantIdentificationPaths(identificationId);
  redirect(`/garden/identify/${identificationId}?saved=1`);
}

async function getAreaName(areaId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("garden_areas")
    .select("name")
    .eq("id", areaId)
    .eq("garden_id", ANN_GARDEN_ID)
    .maybeSingle();

  return data?.name;
}

async function getIdentification(identificationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("plant_identifications")
    .select("*")
    .eq("id", identificationId)
    .eq("garden_id", ANN_GARDEN_ID)
    .single();

  if (error) {
    redirect(`/garden/identify/${identificationId}?identifyError=not-found`);
  }

  return data;
}

async function markIdentificationApplied(
  identificationId: string,
  plantId: string,
  photoId: string | null,
) {
  const supabase = createSupabaseAdminClient();
  const update: PlantIdentificationUpdate = {
    applied_at: new Date().toISOString(),
    plant_id: plantId,
    status: "applied",
  };
  const { error } = await supabase
    .from("plant_identifications")
    .update(update)
    .eq("id", identificationId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    redirect(`/garden/identify/${identificationId}?identifyError=save-failed`);
  }

  if (photoId) {
    await supabase
      .from("photos")
      .update({ plant_id: plantId })
      .eq("id", photoId)
      .eq("garden_id", ANN_GARDEN_ID);
  }
}

function revalidatePlantIdentificationPaths(identificationId: string, areaId?: string) {
  revalidatePath("/garden");
  revalidatePath("/garden/identify");
  revalidatePath(`/garden/identify/${identificationId}`);
  revalidatePath("/photos");

  if (areaId) {
    revalidatePath(`/garden/areas/${areaId}`);
  }
}

function storagePathFor(file: File) {
  const extension = fileExtension(file);
  const parts = todayParts();
  return `${ANN_GARDEN_ID}/ai-identifications/${parts.year}/${crypto.randomUUID()}.${extension}`;
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

function dataUrlFor(file: File, bytes: ArrayBuffer) {
  const mimeType = file.type || "image/jpeg";
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

function requiredText(formData: FormData, key: string) {
  const value = optionalText(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
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

function emptyToNull(value: string) {
  return value.trim().length ? value.trim() : null;
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
