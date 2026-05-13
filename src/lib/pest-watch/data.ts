import "server-only";

import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type {
  PestDiseaseIssue,
  PestDiseaseLog,
} from "@/types/garden";

type AreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
type IssueRow = Database["public"]["Tables"]["pest_disease_issues"]["Row"];
type LogRow = Database["public"]["Tables"]["pest_disease_logs"]["Row"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TaskInstanceRow = Database["public"]["Tables"]["task_instances"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export type PestWatchOption = {
  id: string;
  name: string;
};

export type PestWatchFormOptions = {
  areas: PestWatchOption[];
  issues: PestWatchOption[];
  plants: PestWatchOption[];
  profiles: PestWatchOption[];
};

export type PestWatchTask = {
  id: string;
  href?: string;
  title: string;
  description: string;
  dueLabel: string;
  month: number;
  priority: "low" | "medium" | "high";
  areaName?: string;
  plantName?: string;
};

export type PestWatchData = {
  currentMonthName: string;
  currentMonthIssues: PestDiseaseIssue[];
  formOptions: PestWatchFormOptions;
  issues: PestDiseaseIssue[];
  recentLogs: PestDiseaseLog[];
  watchTasks: PestWatchTask[];
};

export async function getPestWatchData(): Promise<PestWatchData> {
  const supabase = createSupabaseAdminClient();
  const today = todayParts();
  const [
    issuesResult,
    logsResult,
    areasResult,
    plantsResult,
    profilesResult,
    tasksResult,
    instancesResult,
  ] = await Promise.all([
    supabase
      .from("pest_disease_issues")
      .select("*")
      .order("issue_type", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("pest_disease_logs")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("observed_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
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
    supabase
      .from("tasks")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .in("task_type", ["inspection", "pest_watch"])
      .is("archived_at", null)
      .eq("is_hidden", false)
      .order("month", { ascending: true })
      .order("title", { ascending: true }),
    supabase
      .from("task_instances")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .eq("year", today.year),
  ]);

  if (issuesResult.error) {
    throw new Error(issuesResult.error.message);
  }

  if (logsResult.error) {
    throw new Error(logsResult.error.message);
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

  if (tasksResult.error) {
    throw new Error(tasksResult.error.message);
  }

  if (instancesResult.error) {
    throw new Error(instancesResult.error.message);
  }

  const areas = areasResult.data ?? [];
  const plants = plantsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const areaById = new Map(areas.map((area) => [area.id, area]));
  const plantById = new Map(plants.map((plant) => [plant.id, plant]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const issues = (issuesResult.data ?? []).map(mapIssue);
  const issueById = new Map(issues.map((issue) => [issue.id, issue]));
  const instanceByTaskId = new Map(
    (instancesResult.data ?? []).map((instance) => [instance.task_id, instance]),
  );

  return {
    currentMonthName: monthName(today.month),
    currentMonthIssues: issues.filter((issue) =>
      issue.likelyMonths.includes(today.month),
    ),
    formOptions: {
      areas: mapOptions(areas, "name"),
      issues: issues.map((issue) => ({ id: issue.id, name: issue.name })),
      plants: mapOptions(plants, "common_name"),
      profiles: mapOptions(profiles, "display_name"),
    },
    issues,
    recentLogs: (logsResult.data ?? []).map((log) =>
      mapLog({
        area: log.area_id ? areaById.get(log.area_id) : undefined,
        issue: issueById.get(log.issue_id),
        log,
        plant: log.plant_id ? plantById.get(log.plant_id) : undefined,
        profile: log.observed_by ? profileById.get(log.observed_by) : undefined,
      }),
    ),
    watchTasks: (tasksResult.data ?? [])
      .map((task) =>
        mapWatchTask({
          area: task.area_id ? areaById.get(task.area_id) : undefined,
          instance: instanceByTaskId.get(task.id),
          plant: task.plant_id ? plantById.get(task.plant_id) : undefined,
          task,
        }),
      )
      .sort((left, right) => sortBySeason(left, right, today.month)),
  };
}

function mapIssue(issue: IssueRow): PestDiseaseIssue {
  return {
    id: issue.id,
    name: issue.name,
    issueType: issue.issue_type,
    description: issue.description ?? "No description recorded yet.",
    symptoms: issue.symptoms ?? "Symptoms not recorded yet.",
    affectedPlants: issue.affected_plants ?? "Affected plants not recorded yet.",
    likelyMonths: issue.likely_months,
    preventionNote: issue.prevention_note ?? "Prevention note not recorded yet.",
    organicTreatmentNote:
      issue.organic_treatment_note ?? "Organic-first note not recorded yet.",
    chemicalCautionNote:
      issue.chemical_caution_note ?? "Chemical caution not recorded yet.",
    severity: issue.severity,
    whenToSeekHelp: issue.when_to_seek_help ?? "Help threshold not recorded yet.",
    externalUrl: issue.external_url ?? undefined,
  };
}

function mapLog({
  area,
  issue,
  log,
  plant,
  profile,
}: {
  area?: AreaRow;
  issue?: PestDiseaseIssue;
  log: LogRow;
  plant?: PlantRow;
  profile?: ProfileRow;
}): PestDiseaseLog {
  return {
    id: log.id,
    issueId: log.issue_id,
    issueName: issue?.name ?? "Pest/disease issue",
    issueType: issue?.issueType ?? "unknown",
    areaId: log.area_id ?? undefined,
    areaName: area?.name,
    plantId: log.plant_id ?? undefined,
    plantName: plant?.common_name,
    observedAt: formatDate(log.observed_at),
    observedBy: profile?.display_name,
    observedById: log.observed_by ?? undefined,
    severity: log.severity,
    note: log.note ?? undefined,
  };
}

function mapWatchTask({
  area,
  instance,
  plant,
  task,
}: {
  area?: AreaRow;
  instance?: TaskInstanceRow;
  plant?: PlantRow;
  task: TaskRow;
}): PestWatchTask {
  return {
    id: task.id,
    href: instance ? `/tasks/${instance.id}` : undefined,
    title: task.title,
    description: task.description ?? "No description recorded yet.",
    dueLabel: instance
      ? formatDueLabel(instance)
      : task.month
        ? monthName(task.month)
        : "No month set",
    month: task.month ?? 12,
    priority: task.priority,
    areaName: area?.name,
    plantName: plant?.common_name,
  };
}

function formatDueLabel(instance: TaskInstanceRow) {
  if (instance.due_start_date && instance.due_end_date) {
    if (instance.due_start_date === instance.due_end_date) {
      return formatDate(instance.due_start_date);
    }

    return `${formatDate(instance.due_start_date)} to ${formatDate(instance.due_end_date)}`;
  }

  return monthName(instance.month);
}

function sortBySeason(
  left: PestWatchTask,
  right: PestWatchTask,
  currentMonth: number,
) {
  const leftDistance = seasonalDistance(left.month, currentMonth);
  const rightDistance = seasonalDistance(right.month, currentMonth);
  return leftDistance - rightDistance || left.title.localeCompare(right.title);
}

function seasonalDistance(month: number, currentMonth: number) {
  return (month - currentMonth + 12) % 12;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function monthName(month: number) {
  return new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
    new Date(Date.UTC(2026, month - 1, 1)),
  );
}

function mapOptions<T extends { id: string }>(
  rows: T[],
  key: keyof T,
): PestWatchOption[] {
  return rows.map((row) => ({
    id: row.id,
    name: String(row[key]),
  }));
}

function todayParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  }).formatToParts(new Date());

  return {
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    year: Number(parts.find((part) => part.type === "year")?.value ?? "2026"),
  };
}
