import "server-only";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type { DiaryEntry } from "@/types/garden";

type AreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
type DiaryEntryRow = Database["public"]["Tables"]["diary_entries"]["Row"];
type DiaryEntryTagRow = Database["public"]["Tables"]["diary_entry_tags"]["Row"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type TaskInstanceRow = Database["public"]["Tables"]["task_instances"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export type DiaryOption = {
  id: string;
  name: string;
};

export type DiaryFormOptions = {
  areas: DiaryOption[];
  plants: DiaryOption[];
  profiles: DiaryOption[];
  tags: DiaryOption[];
  tasks: DiaryOption[];
};

export type DiaryData = {
  entries: DiaryEntry[];
  formOptions: DiaryFormOptions;
};

export async function getDiaryData(): Promise<DiaryData> {
  const supabase = createSupabaseAdminClient();
  const [
    entriesResult,
    entryTagsResult,
    tagsResult,
    areasResult,
    plantsResult,
    profilesResult,
    taskInstancesResult,
    tasksResult,
  ] = await Promise.all([
    supabase
      .from("diary_entries")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("diary_entry_tags").select("*"),
    supabase
      .from("tags")
      .select("*")
      .eq("type", "diary")
      .order("name", { ascending: true }),
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
      .from("task_instances")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
    supabase.from("tasks").select("*").eq("garden_id", ANN_GARDEN_ID),
  ]);

  if (entriesResult.error) {
    throw new Error(entriesResult.error.message);
  }

  if (entryTagsResult.error) {
    throw new Error(entryTagsResult.error.message);
  }

  if (tagsResult.error) {
    throw new Error(tagsResult.error.message);
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

  if (taskInstancesResult.error) {
    throw new Error(taskInstancesResult.error.message);
  }

  if (tasksResult.error) {
    throw new Error(tasksResult.error.message);
  }

  const areas = areasResult.data ?? [];
  const plants = plantsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const tags = tagsResult.data ?? [];
  const taskInstances = taskInstancesResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const areaById = new Map(areas.map((area) => [area.id, area]));
  const plantById = new Map(plants.map((plant) => [plant.id, plant]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const taskInstanceById = new Map(
    taskInstances.map((instance) => [instance.id, instance]),
  );
  const tagsByEntryId = groupTagsByEntryId(entryTagsResult.data ?? [], tags);

  return {
    entries: (entriesResult.data ?? []).map((entry) =>
      mapDiaryEntry({
        area: entry.area_id ? areaById.get(entry.area_id) : undefined,
        entry,
        followUpTask: entry.follow_up_task_id
          ? taskById.get(entry.follow_up_task_id)
          : undefined,
        plant: entry.plant_id ? plantById.get(entry.plant_id) : undefined,
        profile: entry.created_by ? profileById.get(entry.created_by) : undefined,
        tags: tagsByEntryId.get(entry.id) ?? [],
        task: getTaskForInstance(entry.task_instance_id, taskInstanceById, taskById),
      }),
    ),
    formOptions: {
      areas: mapOptions(areas, "name"),
      plants: mapOptions(plants, "common_name"),
      profiles: mapOptions(profiles, "display_name"),
      tags: mapOptions(tags, "name"),
      tasks: taskInstances
        .map((instance) => {
          const task = taskById.get(instance.task_id);
          return task
            ? {
                id: instance.id,
                name: `${task.title} (${monthName(instance.month)})`,
              }
            : null;
        })
        .filter((option): option is DiaryOption => Boolean(option)),
    },
  };
}

function mapDiaryEntry({
  area,
  entry,
  followUpTask,
  plant,
  profile,
  tags,
  task,
}: {
  area?: AreaRow;
  entry: DiaryEntryRow;
  followUpTask?: TaskRow;
  plant?: PlantRow;
  profile?: ProfileRow;
  tags: string[];
  task?: TaskRow;
}): DiaryEntry {
  return {
    id: entry.id,
    title: entry.title ?? "Garden note",
    quickNote: entry.quick_note,
    entryDate: formatEntryDate(entry.entry_date),
    createdBy: profile?.display_name ?? "Unknown",
    areaId: entry.area_id ?? undefined,
    areaName: area?.name,
    plantId: entry.plant_id ?? undefined,
    plantName: plant?.common_name,
    taskId: entry.task_instance_id ?? undefined,
    taskName: task?.title,
    tags,
    whatWentWell: entry.what_went_well ?? undefined,
    whatWentBadly: entry.what_went_badly ?? undefined,
    whatToTryNext: entry.what_to_try_next ?? undefined,
    followUpNeeded: entry.follow_up_needed,
    followUpTaskId: entry.follow_up_task_id ?? undefined,
    followUpTaskTitle: followUpTask?.title,
  };
}

function groupTagsByEntryId(entryTags: DiaryEntryTagRow[], tags: TagRow[]) {
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));

  return entryTags.reduce((groups, entryTag) => {
    const tag = tagById.get(entryTag.tag_id);

    if (!tag) {
      return groups;
    }

    const current = groups.get(entryTag.diary_entry_id) ?? [];
    current.push(tag.name);
    groups.set(entryTag.diary_entry_id, current);
    return groups;
  }, new Map<string, string[]>());
}

function getTaskForInstance(
  instanceId: string | null,
  taskInstanceById: Map<string, TaskInstanceRow>,
  taskById: Map<string, TaskRow>,
) {
  if (!instanceId) {
    return undefined;
  }

  const instance = taskInstanceById.get(instanceId);
  return instance ? taskById.get(instance.task_id) : undefined;
}

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function monthName(month: number) {
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(
    new Date(Date.UTC(2026, month - 1, 1)),
  );
}

function mapOptions<T extends { id: string }>(
  rows: T[],
  key: keyof T,
): DiaryOption[] {
  return rows.map((row) => ({
    id: row.id,
    name: String(row[key]),
  }));
}
