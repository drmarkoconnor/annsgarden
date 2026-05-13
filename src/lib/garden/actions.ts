"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import type { Database } from "@/lib/supabase/database.types";

type AreaInsert = Database["public"]["Tables"]["garden_areas"]["Insert"];
type AreaUpdate = Database["public"]["Tables"]["garden_areas"]["Update"];
type PlantInsert = Database["public"]["Tables"]["plants"]["Insert"];
type PlantUpdate = Database["public"]["Tables"]["plants"]["Update"];
type HealthStatus = Database["public"]["Tables"]["plants"]["Row"]["health_status"];
type PlantStatus = Database["public"]["Tables"]["plants"]["Row"]["status"];

const healthStatuses = new Set<HealthStatus>([
  "thriving",
  "okay",
  "needs_attention",
  "struggling",
  "unknown",
]);

const plantStatuses = new Set<PlantStatus>(["active", "removed", "dead", "unknown"]);

export async function createGardenArea(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const payload: AreaInsert = {
    garden_id: ANN_GARDEN_ID,
    name: requiredText(formData, "name"),
    description: optionalText(formData, "description"),
    sunlight: optionalText(formData, "sunlight"),
    soil_type: optionalText(formData, "soil_type"),
    soil_ph: optionalText(formData, "soil_ph"),
    drainage: optionalText(formData, "drainage"),
    moisture_notes: optionalText(formData, "moisture_notes"),
    microclimate_notes: optionalText(formData, "microclimate_notes"),
    display_order: optionalNumber(formData, "display_order") ?? 999,
  };

  const { error } = await supabase.from("garden_areas").insert(payload);

  if (error) {
    handleMutationError("area", error);
  }

  revalidatePath("/garden");
}

export async function updateGardenArea(areaId: string, formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const payload: AreaUpdate = {
    name: requiredText(formData, "name"),
    description: optionalText(formData, "description"),
    sunlight: optionalText(formData, "sunlight"),
    soil_type: optionalText(formData, "soil_type"),
    soil_ph: optionalText(formData, "soil_ph"),
    drainage: optionalText(formData, "drainage"),
    moisture_notes: optionalText(formData, "moisture_notes"),
    microclimate_notes: optionalText(formData, "microclimate_notes"),
    display_order: optionalNumber(formData, "display_order") ?? 999,
  };

  const { error } = await supabase
    .from("garden_areas")
    .update(payload)
    .eq("id", areaId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    handleMutationError("area", error);
  }

  revalidatePath("/garden");
}

export async function archiveGardenArea(areaId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("garden_areas")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", areaId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    handleMutationError("area", error);
  }

  revalidatePath("/garden");
}

export async function restoreGardenArea(areaId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("garden_areas")
    .update({ archived_at: null })
    .eq("id", areaId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    handleMutationError("area", error);
  }

  revalidatePath("/garden");
}

export async function createPlant(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const isUnknown = formData.get("is_unknown") === "on";
  const payload: PlantInsert = {
    garden_id: ANN_GARDEN_ID,
    common_name: requiredText(formData, "common_name"),
    latin_name: optionalText(formData, "latin_name"),
    cultivar: optionalText(formData, "cultivar"),
    plant_type: optionalText(formData, "plant_type"),
    primary_area_id: optionalUuid(formData, "primary_area_id"),
    status: parsePlantStatus(formData),
    health_status: parseHealthStatus(formData),
    general_notes: optionalText(formData, "general_notes"),
    is_unknown: isUnknown,
  };

  const { error } = await supabase.from("plants").insert(payload);

  if (error) {
    handleMutationError("plant", error);
  }

  revalidatePath("/garden");
}

export async function updatePlant(plantId: string, formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const isUnknown = formData.get("is_unknown") === "on";
  const payload: PlantUpdate = {
    common_name: requiredText(formData, "common_name"),
    latin_name: optionalText(formData, "latin_name"),
    cultivar: optionalText(formData, "cultivar"),
    plant_type: optionalText(formData, "plant_type"),
    primary_area_id: optionalUuid(formData, "primary_area_id"),
    status: parsePlantStatus(formData),
    health_status: parseHealthStatus(formData),
    general_notes: optionalText(formData, "general_notes"),
    is_unknown: isUnknown,
  };

  const { error } = await supabase
    .from("plants")
    .update(payload)
    .eq("id", plantId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    handleMutationError("plant", error);
  }

  revalidatePath("/garden");
}

export async function archivePlant(plantId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("plants")
    .update({
      archived_at: new Date().toISOString(),
      status: "removed",
    })
    .eq("id", plantId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    handleMutationError("plant", error);
  }

  revalidatePath("/garden");
}

export async function restorePlant(plantId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("plants")
    .update({
      archived_at: null,
      status: "active",
    })
    .eq("id", plantId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (error) {
    handleMutationError("plant", error);
  }

  revalidatePath("/garden");
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

function optionalNumber(formData: FormData, key: string) {
  const value = optionalText(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalUuid(formData: FormData, key: string) {
  const value = optionalText(formData, key);
  return value ?? null;
}

function parseHealthStatus(formData: FormData): HealthStatus {
  const value = optionalText(formData, "health_status") ?? "unknown";
  return healthStatuses.has(value as HealthStatus) ? (value as HealthStatus) : "unknown";
}

function parsePlantStatus(formData: FormData): PlantStatus {
  const value = optionalText(formData, "status") ?? "active";
  return plantStatuses.has(value as PlantStatus) ? (value as PlantStatus) : "active";
}

function handleMutationError(scope: "area" | "plant", error: { code?: string }) {
  if (scope === "area" && error.code === "23505") {
    redirect("/garden?areaError=duplicate");
  }

  redirect(`/garden?${scope}Error=save-failed`);
}
