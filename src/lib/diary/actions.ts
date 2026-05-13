"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type DiaryEntryInsert = Database["public"]["Tables"]["diary_entries"]["Insert"];
type DiaryEntryUpdate = Database["public"]["Tables"]["diary_entries"]["Update"];
type DiaryEntryTagInsert = Database["public"]["Tables"]["diary_entry_tags"]["Insert"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskInstanceInsert = Database["public"]["Tables"]["task_instances"]["Insert"];

export async function createDiaryEntry(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const quickNote = requiredText(formData, "quick_note");
  const followUpTitle = optionalText(formData, "follow_up_title");
  const followUpNeeded =
    formData.get("follow_up_needed") === "on" || Boolean(followUpTitle);
  const payload: DiaryEntryInsert = {
    garden_id: ANN_GARDEN_ID,
    created_by: optionalUuid(formData, "created_by"),
    entry_date: optionalText(formData, "entry_date") ?? todayIsoDate(),
    title: optionalText(formData, "title") ?? deriveTitle(quickNote),
    quick_note: quickNote,
    area_id: optionalUuid(formData, "area_id"),
    plant_id: optionalUuid(formData, "plant_id"),
    task_instance_id: optionalUuid(formData, "task_instance_id"),
    what_went_well: optionalText(formData, "what_went_well"),
    what_went_badly: optionalText(formData, "what_went_badly"),
    what_to_try_next: optionalText(formData, "what_to_try_next"),
    follow_up_needed: followUpNeeded,
  };

  const { data: diaryEntry, error: diaryError } = await supabase
    .from("diary_entries")
    .insert(payload)
    .select("id")
    .single();

  if (diaryError) {
    redirect("/diary?diaryError=save-failed");
  }

  const tagRows = tagIds(formData).map<DiaryEntryTagInsert>((tagId) => ({
    diary_entry_id: diaryEntry.id,
    tag_id: tagId,
  }));

  if (tagRows.length) {
    const { error: tagError } = await supabase.from("diary_entry_tags").insert(tagRows);

    if (tagError) {
      redirect("/diary?diaryError=save-failed");
    }
  }

  if (followUpTitle) {
    const followUpTaskId = await createFollowUpTask(formData, followUpTitle, quickNote);
    const update: DiaryEntryUpdate = {
      follow_up_task_id: followUpTaskId,
      follow_up_needed: true,
    };
    const { error: updateError } = await supabase
      .from("diary_entries")
      .update(update)
      .eq("id", diaryEntry.id)
      .eq("garden_id", ANN_GARDEN_ID);

    if (updateError) {
      redirect("/diary?diaryError=save-failed");
    }
  }

  revalidatePath("/diary");
  revalidatePath("/");
  redirect("/diary?saved=1");
}

async function createFollowUpTask(
  formData: FormData,
  title: string,
  quickNote: string,
) {
  const supabase = createSupabaseAdminClient();
  const dueDate = optionalText(formData, "follow_up_date");
  const month = dueDate ? Number(dueDate.slice(5, 7)) : currentMonth();
  const year = dueDate ? Number(dueDate.slice(0, 4)) : currentYear();
  const categoryId = await getDiaryFollowUpCategoryId();
  const taskPayload: TaskInsert = {
    garden_id: ANN_GARDEN_ID,
    title,
    description: optionalText(formData, "follow_up_note") ?? quickNote,
    why_it_matters:
      "Created from a diary note so the observation turns into a visible garden job.",
    category_id: categoryId,
    area_id: optionalUuid(formData, "area_id"),
    plant_id: optionalUuid(formData, "plant_id"),
    task_type: "diary_follow_up",
    priority: "medium",
    recurrence_type: "one_off",
    month,
    timing_window: dueDate ? "specific_date" : "all_month",
    created_by: optionalUuid(formData, "created_by"),
  };

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert(taskPayload)
    .select("id")
    .single();

  if (taskError) {
    redirect("/diary?diaryError=save-failed");
  }

  const dueWindow = dueDate
    ? { start: dueDate, end: dueDate }
    : getMonthWindow(year, month);
  const instancePayload: TaskInstanceInsert = {
    task_id: task.id,
    garden_id: ANN_GARDEN_ID,
    year,
    month,
    due_start_date: dueWindow.start,
    due_end_date: dueWindow.end,
    status: "not_started",
    assigned_to: optionalUuid(formData, "created_by"),
  };

  const { error: instanceError } = await supabase
    .from("task_instances")
    .insert(instancePayload);

  if (instanceError) {
    redirect("/diary?diaryError=save-failed");
  }

  return task.id;
}

async function getDiaryFollowUpCategoryId() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("type", "task")
    .eq("name", "diary follow-up")
    .maybeSingle();

  if (error) {
    redirect("/diary?diaryError=save-failed");
  }

  return data?.id ?? null;
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

function tagIds(formData: FormData) {
  return formData
    .getAll("tag_ids")
    .filter((value): value is string => typeof value === "string" && value !== "none");
}

function deriveTitle(quickNote: string) {
  const firstSentence = quickNote.split(/[.!?]/)[0]?.trim();

  if (!firstSentence) {
    return "Garden note";
  }

  return firstSentence.length > 48
    ? `${firstSentence.slice(0, 45).trim()}...`
    : firstSentence;
}

function getMonthWindow(year: number, month: number) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    start: dateString(year, month, 1),
    end: dateString(year, month, lastDay),
  };
}

function dateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayIsoDate() {
  const parts = todayParts();
  return dateString(parts.year, parts.month, parts.day);
}

function currentMonth() {
  return todayParts().month;
}

function currentYear() {
  return todayParts().year;
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
