"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSignedIn } from "@/lib/auth/guards";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type PestDiseaseLogInsert =
  Database["public"]["Tables"]["pest_disease_logs"]["Insert"];
type PestDiseaseSeverity =
  Database["public"]["Tables"]["pest_disease_logs"]["Row"]["severity"];

const severities = new Set<PestDiseaseSeverity>([
  "low",
  "medium",
  "high",
  "unknown",
]);

export async function createPestDiseaseLog(formData: FormData) {
  await requireSignedIn();

  const issueId = optionalUuid(formData, "issue_id");

  if (!issueId) {
    redirect("/more/pest-watch?pestError=missing-issue");
  }

  const payload: PestDiseaseLogInsert = {
    garden_id: ANN_GARDEN_ID,
    issue_id: issueId,
    plant_id: optionalUuid(formData, "plant_id"),
    area_id: optionalUuid(formData, "area_id"),
    observed_by: optionalUuid(formData, "observed_by"),
    observed_at: optionalText(formData, "observed_at") ?? todayIsoDate(),
    severity: parseSeverity(formData),
    note: optionalText(formData, "note"),
  };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("pest_disease_logs").insert(payload);

  if (error) {
    redirect("/more/pest-watch?pestError=save-failed");
  }

  revalidatePath("/more/pest-watch");
  redirect("/more/pest-watch?saved=1");
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

function parseSeverity(formData: FormData): PestDiseaseSeverity {
  const value = optionalText(formData, "severity") ?? "unknown";
  return severities.has(value as PestDiseaseSeverity)
    ? (value as PestDiseaseSeverity)
    : "unknown";
}

function todayIsoDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  }).formatToParts(new Date());

  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";

  return `${year}-${month}-${day}`;
}
