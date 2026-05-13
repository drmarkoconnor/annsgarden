"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSignedIn } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryType = Database["public"]["Tables"]["categories"]["Row"]["type"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];
type ProfileRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const categoryTypes = new Set<CategoryType>(["diary", "photo", "plant", "task"]);
const profileRoles = new Set<ProfileRole>(["gardener", "helper", "owner"]);

export async function updateProfile(profileId: string, formData: FormData) {
  await requireSignedIn();
  const payload: ProfileUpdate = {
    display_name: requiredText(formData, "display_name"),
    email: optionalText(formData, "email"),
    role: parseProfileRole(formData),
  };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("profiles").update(payload).eq("id", profileId);

  if (error) {
    redirect(`/more?adminError=${error.code === "23505" ? "duplicate-profile" : "save-failed"}`);
  }

  revalidatePath("/more");
}

export async function createCategory(formData: FormData) {
  await requireSignedIn();
  const payload: CategoryInsert = {
    display_order: optionalNumber(formData, "display_order") ?? 999,
    name: requiredText(formData, "name"),
    type: parseCategoryType(formData),
  };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").insert(payload);

  if (error) {
    redirect(`/more?adminError=${error.code === "23505" ? "duplicate-category" : "save-failed"}`);
  }

  revalidatePath("/more");
  redirect("/more?saved=1");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireSignedIn();
  const payload: CategoryUpdate = {
    display_order: optionalNumber(formData, "display_order") ?? 999,
    name: requiredText(formData, "name"),
    type: parseCategoryType(formData),
  };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", categoryId);

  if (error) {
    redirect(`/more?adminError=${error.code === "23505" ? "duplicate-category" : "save-failed"}`);
  }

  revalidatePath("/more");
}

export async function archiveCategory(categoryId: string) {
  await requireSignedIn();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("categories")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", categoryId);

  if (error) {
    redirect("/more?adminError=save-failed");
  }

  revalidatePath("/more");
}

export async function restoreCategory(categoryId: string) {
  await requireSignedIn();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("categories")
    .update({ archived_at: null })
    .eq("id", categoryId);

  if (error) {
    redirect("/more?adminError=save-failed");
  }

  revalidatePath("/more");
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

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseCategoryType(formData: FormData): CategoryType {
  const value = optionalText(formData, "type") ?? "task";
  return categoryTypes.has(value as CategoryType) ? (value as CategoryType) : "task";
}

function parseProfileRole(formData: FormData): ProfileRole {
  const value = optionalText(formData, "role") ?? "helper";
  return profileRoles.has(value as ProfileRole) ? (value as ProfileRole) : "helper";
}
