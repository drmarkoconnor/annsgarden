import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import type { Database } from "@/lib/supabase/database.types";
import type {
  GardenTask,
  TaskPriority,
  TaskSection,
  TaskStatus,
  TimingWindow,
} from "@/types/garden";

type AreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskCompletionRow = Database["public"]["Tables"]["task_completions"]["Row"];
type TaskInstanceRow = Database["public"]["Tables"]["task_instances"]["Row"];

export type TaskCompletionRecord = {
  id: string;
  status: TaskStatus;
  completedAt: string;
  completedBy?: string;
  note?: string;
  timeSpentMinutes?: number;
  skipReason?: string;
  postponeReason?: string;
};

export type TaskRecord = GardenTask & {
  instanceId: string;
  taskId: string;
  areaName?: string;
  categoryId?: string;
  completions: TaskCompletionRecord[];
  plantName?: string;
};

export type TaskOption = {
  id: string;
  name: string;
};

export type TaskFormOptions = {
  areas: TaskOption[];
  categories: TaskOption[];
  plants: TaskOption[];
  profiles: TaskOption[];
};

export type TaskDashboardData = {
  allTasks: TaskRecord[];
  overdueTasks: TaskRecord[];
  thisMonthTasks: TaskRecord[];
  upcomingTasks: TaskRecord[];
  historyTasks: TaskRecord[];
  formOptions: TaskFormOptions;
};

const completedStatuses = new Set<TaskStatus>([
  "done",
  "skipped",
  "not_applicable",
]);

export async function getTaskDashboardData(): Promise<TaskDashboardData> {
  const taskData = await getTaskData();
  const allTasks = taskData.tasks;

  return {
    allTasks,
    overdueTasks: allTasks.filter((task) => task.section === "overdue"),
    thisMonthTasks: allTasks.filter((task) => task.section === "this_month"),
    upcomingTasks: allTasks.filter((task) => task.section === "upcoming"),
    historyTasks: allTasks.filter((task) => task.section === "history").slice(0, 5),
    formOptions: taskData.formOptions,
  };
}

export async function getTaskDetail(instanceId: string) {
  const taskData = await getTaskData();
  const task = taskData.tasks.find((item) => item.instanceId === instanceId);

  if (!task) {
    return null;
  }

  return {
    task,
    formOptions: taskData.formOptions,
  };
}

async function getTaskData() {
  const supabase = createSupabaseAdminClient();
  const [
    tasksResult,
    instancesResult,
    completionsResult,
    categoriesResult,
    areasResult,
    plantsResult,
    profilesResult,
  ] = await Promise.all([
    supabase.from("tasks").select("*").eq("garden_id", ANN_GARDEN_ID),
    supabase
      .from("task_instances")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("year", { ascending: true })
      .order("month", { ascending: true })
      .order("due_start_date", { ascending: true }),
    supabase
      .from("task_completions")
      .select("*")
      .order("completed_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("type", "task")
      .is("archived_at", null)
      .order("display_order", { ascending: true }),
    supabase
      .from("garden_areas")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .is("archived_at", null)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("plants")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .is("archived_at", null)
      .order("common_name", { ascending: true }),
    supabase.from("profiles").select("*").order("display_name", { ascending: true }),
  ]);

  if (tasksResult.error) {
    throw new Error(tasksResult.error.message);
  }

  if (instancesResult.error) {
    throw new Error(instancesResult.error.message);
  }

  if (completionsResult.error) {
    throw new Error(completionsResult.error.message);
  }

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (areasResult.error) {
    throw new Error(areasResult.error.message);
  }

  if (plantsResult.error) {
    throw new Error(plantsResult.error.message);
  }

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  const taskById = new Map((tasksResult.data ?? []).map((task) => [task.id, task]));
  const categoryById = new Map(
    (categoriesResult.data ?? []).map((category) => [category.id, category]),
  );
  const areaById = new Map((areasResult.data ?? []).map((area) => [area.id, area]));
  const plantById = new Map((plantsResult.data ?? []).map((plant) => [plant.id, plant]));
  const profileById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );
  const completionsByInstanceId = groupCompletions(
    completionsResult.data ?? [],
    profileById,
  );

  const tasks = (instancesResult.data ?? [])
    .map((instance) => {
      const task = taskById.get(instance.task_id);

      if (!task || task.archived_at || task.is_hidden) {
        return null;
      }

      return mapTaskRecord({
        instance,
        task,
        category: task.category_id ? categoryById.get(task.category_id) : undefined,
        area: task.area_id ? areaById.get(task.area_id) : undefined,
        plant: task.plant_id ? plantById.get(task.plant_id) : undefined,
        assignedProfile: instance.assigned_to
          ? profileById.get(instance.assigned_to)
          : undefined,
        completions: completionsByInstanceId.get(instance.id) ?? [],
      });
    })
    .filter((task): task is TaskRecord => Boolean(task))
    .sort(sortTasks);

  return {
    tasks,
    formOptions: {
      areas: mapOptions(areasResult.data ?? [], "name"),
      categories: mapOptions(categoriesResult.data ?? [], "name", formatCategoryName),
      plants: mapOptions(plantsResult.data ?? [], "common_name"),
      profiles: mapOptions(profilesResult.data ?? [], "display_name"),
    },
  };
}

function mapTaskRecord({
  instance,
  task,
  category,
  area,
  plant,
  assignedProfile,
  completions,
}: {
  instance: TaskInstanceRow;
  task: TaskRow;
  category?: CategoryRow;
  area?: AreaRow;
  plant?: PlantRow;
  assignedProfile?: ProfileRow;
  completions: TaskCompletionRecord[];
}): TaskRecord {
  const latestCompletion = completions[0];
  const status = displayStatus(instance);
  const section = getTaskSection(instance, status);

  return {
    id: instance.id,
    instanceId: instance.id,
    taskId: task.id,
    title: task.title,
    description: task.description ?? "No description recorded yet.",
    whyItMatters: task.why_it_matters ?? "No extra guidance recorded yet.",
    category: category ? formatCategoryName(category.name) : "Task",
    categoryId: task.category_id ?? undefined,
    priority: task.priority as TaskPriority,
    status,
    storedStatus: instance.status as TaskStatus,
    section,
    month: monthName(instance.month),
    timingWindow: task.timing_window as TimingWindow,
    dueLabel: formatDueLabel(instance, status, section, latestCompletion),
    areaId: task.area_id ?? undefined,
    areaName: area?.name,
    plantId: task.plant_id ?? undefined,
    plantName: plant?.common_name,
    assignedTo: assignedProfile?.display_name,
    assignedToId: instance.assigned_to ?? undefined,
    estimatedMinutes: task.estimated_minutes ?? undefined,
    toolsNeeded: task.tools_needed ?? undefined,
    weatherWarning: task.weather_warning ?? undefined,
    safetyWarning: task.safety_warning ?? undefined,
    wildlifeWarning: task.wildlife_warning ?? undefined,
    notes: latestCompletion?.note,
    completedBy: latestCompletion?.completedBy,
    completedById: latestCompletion ? undefined : undefined,
    completedDate: latestCompletion?.completedAt,
    dueStartDate: instance.due_start_date ?? undefined,
    dueEndDate: instance.due_end_date ?? undefined,
    postponedUntil: instance.postponed_until ?? undefined,
    completions,
  };
}

function groupCompletions(
  completions: TaskCompletionRow[],
  profileById: Map<string, ProfileRow>,
) {
  return completions.reduce((groups, completion) => {
    const current = groups.get(completion.task_instance_id) ?? [];
    const profile = completion.completed_by
      ? profileById.get(completion.completed_by)
      : undefined;

    current.push({
      id: completion.id,
      status: completion.status as TaskStatus,
      completedAt: completion.completed_at,
      completedBy: profile?.display_name,
      note: completion.note ?? undefined,
      timeSpentMinutes: completion.time_spent_minutes ?? undefined,
      skipReason: completion.skip_reason ?? undefined,
      postponeReason: completion.postpone_reason ?? undefined,
    });

    groups.set(completion.task_instance_id, current);
    return groups;
  }, new Map<string, TaskCompletionRecord[]>());
}

function displayStatus(instance: TaskInstanceRow): TaskStatus {
  const status = instance.status as TaskStatus;

  if (completedStatuses.has(status) || status === "partial" || status === "postponed") {
    return status;
  }

  if (isOverdue(instance)) {
    return "overdue";
  }

  return status;
}

function getTaskSection(instance: TaskInstanceRow, status: TaskStatus): TaskSection {
  const storedStatus = instance.status as TaskStatus;

  if (completedStatuses.has(storedStatus)) {
    return "history";
  }

  if (status === "overdue") {
    return "overdue";
  }

  if (isPostponedForLater(instance)) {
    return "upcoming";
  }

  if (isCurrentMonth(instance)) {
    return "this_month";
  }

  return "upcoming";
}

function isCurrentMonth(instance: TaskInstanceRow) {
  const today = todayParts();
  return instance.year === today.year && instance.month === today.month;
}

function isOverdue(instance: TaskInstanceRow) {
  const status = instance.status as TaskStatus;

  if (completedStatuses.has(status) || isPostponedForLater(instance)) {
    return false;
  }

  const endDate = instance.postponed_until ?? instance.due_end_date;
  return Boolean(endDate && endDate < todayIsoDate());
}

function isPostponedForLater(instance: TaskInstanceRow) {
  return (
    instance.status === "postponed" &&
    Boolean(instance.postponed_until && instance.postponed_until >= todayIsoDate())
  );
}

function sortTasks(a: TaskRecord, b: TaskRecord) {
  const sectionOrder: Record<TaskSection, number> = {
    overdue: 0,
    this_month: 1,
    upcoming: 2,
    history: 3,
  };
  const sectionDifference = sectionOrder[a.section] - sectionOrder[b.section];

  if (sectionDifference !== 0) {
    return sectionDifference;
  }

  if (a.section === "history") {
    return (b.completedDate ?? "").localeCompare(a.completedDate ?? "");
  }

  const priorityDifference = priorityRank(b.priority) - priorityRank(a.priority);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return (a.dueStartDate ?? "").localeCompare(b.dueStartDate ?? "");
}

function priorityRank(priority: TaskPriority) {
  return { low: 1, medium: 2, high: 3 }[priority];
}

function formatDueLabel(
  instance: TaskInstanceRow,
  status: TaskStatus,
  section: TaskSection,
  latestCompletion?: TaskCompletionRecord,
) {
  if (section === "history" && latestCompletion) {
    return `${statusLabel(latestCompletion.status)} ${formatShortDate(latestCompletion.completedAt)}`;
  }

  if (status === "postponed" && instance.postponed_until) {
    return `Postponed to ${formatShortDate(instance.postponed_until)}`;
  }

  if (status === "overdue") {
    const date = instance.due_end_date ?? instance.postponed_until;
    return date ? `Overdue since ${formatShortDate(date)}` : "Overdue";
  }

  if (section === "upcoming" && instance.due_start_date) {
    return `Upcoming ${formatShortDate(instance.due_start_date)}`;
  }

  if (isDueNow(instance)) {
    return "Due now";
  }

  return `Due ${timingWindowLabel(instance)} ${monthName(instance.month)}`;
}

function isDueNow(instance: TaskInstanceRow) {
  const today = todayIsoDate();
  return Boolean(
    instance.due_start_date &&
      instance.due_end_date &&
      instance.due_start_date <= today &&
      instance.due_end_date >= today,
  );
}

function timingWindowLabel(instance: TaskInstanceRow) {
  const startDay = instance.due_start_date?.slice(-2);

  if (startDay === "01" && instance.due_end_date?.slice(-2) === "10") {
    return "early";
  }

  if (startDay === "11") {
    return "mid";
  }

  if (startDay === "21") {
    return "late";
  }

  return "";
}

function statusLabel(status: TaskStatus) {
  const labels: Record<TaskStatus, string> = {
    not_started: "Not started",
    done: "Completed",
    partial: "Part done",
    postponed: "Postponed",
    skipped: "Skipped",
    not_applicable: "Marked not applicable",
    overdue: "Overdue",
  };

  return labels[status];
}

function formatCategoryName(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
}

function monthName(month: number) {
  return new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
    new Date(Date.UTC(2026, month - 1, 1)),
  );
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

function mapOptions<T extends { id: string }>(
  rows: T[],
  key: keyof T,
  formatter: (value: string) => string = (value) => value,
): TaskOption[] {
  return rows.map((row) => ({
    id: row.id,
    name: formatter(String(row[key])),
  }));
}
