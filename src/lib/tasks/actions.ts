"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type { TaskPriority, TaskStatus, TimingWindow } from "@/types/garden";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskInstanceInsert = Database["public"]["Tables"]["task_instances"]["Insert"];
type TaskInstanceUpdate = Database["public"]["Tables"]["task_instances"]["Update"];
type TaskCompletionInsert = Database["public"]["Tables"]["task_completions"]["Insert"];

const taskStatuses = new Set<TaskStatus>([
  "not_started",
  "done",
  "partial",
  "postponed",
  "skipped",
  "not_applicable",
  "overdue",
]);
const taskPriorities = new Set<TaskPriority>(["low", "medium", "high"]);
const timingWindows = new Set<TimingWindow>([
  "early_month",
  "mid_month",
  "late_month",
  "all_month",
  "specific_date",
]);

export async function createTask(formData: FormData) {
  const supabase = createSupabaseAdminClient();
  const month = optionalNumber(formData, "month") ?? currentMonth();
  const timingWindow = parseTimingWindow(formData);
  const year = yearForMonth(month);
  const dueWindow = getDueWindow(year, month, timingWindow);
  const payload: TaskInsert = {
    garden_id: ANN_GARDEN_ID,
    title: requiredText(formData, "title"),
    description: optionalText(formData, "description"),
    why_it_matters: optionalText(formData, "why_it_matters"),
    category_id: optionalUuid(formData, "category_id"),
    plant_id: optionalUuid(formData, "plant_id"),
    area_id: optionalUuid(formData, "area_id"),
    task_type: "custom",
    priority: parsePriority(formData),
    recurrence_type: "one_off",
    month,
    timing_window: timingWindow,
    estimated_minutes: optionalNumber(formData, "estimated_minutes"),
    tools_needed: optionalList(formData, "tools_needed"),
    created_by: optionalUuid(formData, "created_by"),
  };

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert(payload)
    .select("id")
    .single();

  if (taskError) {
    redirect("/?taskError=save-failed");
  }

  const instancePayload: TaskInstanceInsert = {
    task_id: task.id,
    garden_id: ANN_GARDEN_ID,
    year,
    month,
    due_start_date: dueWindow.start,
    due_end_date: dueWindow.end,
    status: "not_started",
    assigned_to: optionalUuid(formData, "assigned_to"),
  };

  const { error: instanceError } = await supabase
    .from("task_instances")
    .insert(instancePayload);

  if (instanceError) {
    redirect("/?taskError=save-failed");
  }

  revalidatePath("/");
  redirect("/");
}

export async function recordTaskOutcome(instanceId: string, formData: FormData) {
  const status = parseTaskStatus(formData);
  const completedBy = optionalUuid(formData, "completed_by");
  const postponedUntil = status === "postponed" ? optionalText(formData, "postponed_until") : null;
  const supabase = createSupabaseAdminClient();
  const instanceUpdate: TaskInstanceUpdate = {
    status,
    postponed_until: postponedUntil,
  };

  const { error: updateError } = await supabase
    .from("task_instances")
    .update(instanceUpdate)
    .eq("id", instanceId)
    .eq("garden_id", ANN_GARDEN_ID);

  if (updateError) {
    redirect(`/tasks/${instanceId}?taskError=save-failed`);
  }

  const completionPayload: TaskCompletionInsert = {
    task_instance_id: instanceId,
    completed_by: completedBy,
    status,
    note: optionalText(formData, "note"),
    time_spent_minutes: optionalNumber(formData, "time_spent_minutes"),
    skip_reason: status === "skipped" ? optionalText(formData, "skip_reason") : null,
    postpone_reason:
      status === "postponed" ? optionalText(formData, "postpone_reason") : null,
  };

  const { error: completionError } = await supabase
    .from("task_completions")
    .insert(completionPayload);

  if (completionError) {
    redirect(`/tasks/${instanceId}?taskError=save-failed`);
  }

  revalidatePath("/");
  revalidatePath(`/tasks/${instanceId}`);
  redirect(`/tasks/${instanceId}?saved=1`);
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

function optionalNumber(formData: FormData, key: string) {
  const value = optionalText(formData, key);

  if (!value) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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

function parseTaskStatus(formData: FormData): TaskStatus {
  const value = optionalText(formData, "status") ?? "done";
  return taskStatuses.has(value as TaskStatus) ? (value as TaskStatus) : "done";
}

function parsePriority(formData: FormData): TaskPriority {
  const value = optionalText(formData, "priority") ?? "medium";
  return taskPriorities.has(value as TaskPriority) ? (value as TaskPriority) : "medium";
}

function parseTimingWindow(formData: FormData): TimingWindow {
  const value = optionalText(formData, "timing_window") ?? "all_month";
  return timingWindows.has(value as TimingWindow)
    ? (value as TimingWindow)
    : "all_month";
}

function getDueWindow(year: number, month: number, timingWindow: TimingWindow) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const ranges: Record<TimingWindow, [number, number]> = {
    early_month: [1, Math.min(10, lastDay)],
    mid_month: [Math.min(11, lastDay), Math.min(20, lastDay)],
    late_month: [Math.min(21, lastDay), lastDay],
    all_month: [1, lastDay],
    specific_date: [1, lastDay],
  };
  const [startDay, endDay] = ranges[timingWindow];

  return {
    start: dateString(year, month, startDay),
    end: dateString(year, month, endDay),
  };
}

function dateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function currentMonth() {
  return todayParts().month;
}

function yearForMonth(month: number) {
  const today = todayParts();
  return month < today.month ? today.year + 1 : today.year;
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
