import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import type { Database } from "@/lib/supabase/database.types";
import type { DiaryFormOptions } from "@/lib/diary/data";
import type { PhotoFormOptions } from "@/lib/photos/data";
import type { TaskFormOptions } from "@/lib/tasks/data";
import type {
  DiaryEntry,
  GardenArea,
  GardenOrientationPhoto,
  GardenPhoto,
  GardenTask,
  Plant,
  PlantHealthStatus,
  TaskPriority,
  TaskSection,
  TaskStatus,
  TimingWindow,
} from "@/types/garden";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type DiaryEntryRow = Database["public"]["Tables"]["diary_entries"]["Row"];
type DiaryEntryTagRow = Database["public"]["Tables"]["diary_entry_tags"]["Row"];
type GardenRow = Database["public"]["Tables"]["gardens"]["Row"];
type GardenAreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
type PhotoRow = Database["public"]["Tables"]["photos"]["Row"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type TaskInstanceRow = Database["public"]["Tables"]["task_instances"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export type GardenAreaRecord = GardenArea & {
  archivedAt: string | null;
  displayOrder: number;
  descriptionValue: string | null;
  sunlightValue: string | null;
  soilTypeValue: string | null;
  soilPhValue: string | null;
  drainageValue: string | null;
  moistureNotesValue: string | null;
  microclimateNotesValue: string | null;
};

export type PlantRecord = Plant & {
  archivedAt: string | null;
  status: PlantRow["status"];
  generalNotesValue: string | null;
};

export type GardenData = {
  garden: GardenRow;
  activeAreas: GardenAreaRecord[];
  archivedAreas: GardenAreaRecord[];
  activePlants: PlantRecord[];
  archivedPlants: PlantRecord[];
  areaNameById: Map<string, string>;
};

export type AreaWorkspaceData = {
  activeAreas: GardenAreaRecord[];
  area: GardenAreaRecord;
  diaryEntries: DiaryEntry[];
  diaryFormOptions: DiaryFormOptions;
  photoFormOptions: PhotoFormOptions;
  photos: GardenPhoto[];
  plants: PlantRecord[];
  taskFormOptions: TaskFormOptions;
  tasks: GardenTask[];
};

const completedTaskStatuses = new Set<TaskStatus>([
  "done",
  "skipped",
  "not_applicable",
]);

export async function getGardenData(): Promise<GardenData> {
  const supabase = createSupabaseAdminClient();

  const [gardenResult, areasResult, plantsResult, photosResult] = await Promise.all([
    supabase.from("gardens").select("*").eq("id", ANN_GARDEN_ID).single(),
    supabase
      .from("garden_areas")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("plants")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("common_name", { ascending: true }),
    supabase
      .from("photos")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .not("storage_path", "is", null)
      .order("taken_at", { ascending: false })
      .order("uploaded_at", { ascending: false }),
  ]);

  if (gardenResult.error) {
    throw new Error(gardenResult.error.message);
  }

  if (areasResult.error) {
    throw new Error(areasResult.error.message);
  }

  if (plantsResult.error) {
    throw new Error(plantsResult.error.message);
  }

  if (photosResult.error) {
    throw new Error(photosResult.error.message);
  }

  const rows = areasResult.data ?? [];
  const plantRows = plantsResult.data ?? [];
  const photoRows = photosResult.data ?? [];
  const plantCountByAreaId = countPlantsByAreaId(plantRows);
  const areaNameById = new Map(rows.map((area) => [area.id, area.name]));
  const [areaPhotoById, plantPhotoById] = await Promise.all([
    orientationPhotoByParentId(photoRows, "area_id"),
    orientationPhotoByParentId(photoRows, "plant_id"),
  ]);
  const areas = rows.map((area) =>
    mapArea(area, plantCountByAreaId.get(area.id) ?? 0, areaPhotoById.get(area.id)),
  );
  const plants = plantRows.map((plant) => mapPlant(plant, plantPhotoById.get(plant.id)));

  return {
    garden: gardenResult.data,
    activeAreas: areas.filter((area) => !area.archivedAt),
    archivedAreas: areas.filter((area) => area.archivedAt),
    activePlants: plants.filter((plant) => !plant.archivedAt),
    archivedPlants: plants.filter((plant) => plant.archivedAt),
    areaNameById,
  };
}

export async function getAreaWorkspaceData(
  areaId: string,
): Promise<AreaWorkspaceData | null> {
  const supabase = createSupabaseAdminClient();
  const [
    areasResult,
    plantsResult,
    photosResult,
    profilesResult,
    categoriesResult,
    tasksResult,
    taskInstancesResult,
    diaryEntriesResult,
    diaryEntryTagsResult,
    tagsResult,
  ] = await Promise.all([
    supabase
      .from("garden_areas")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("plants")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("common_name", { ascending: true }),
    supabase
      .from("photos")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("taken_at", { ascending: false })
      .order("uploaded_at", { ascending: false }),
    supabase.from("profiles").select("*").order("display_name", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .in("type", ["task", "diary"])
      .is("archived_at", null)
      .order("display_order", { ascending: true }),
    supabase.from("tasks").select("*").eq("garden_id", ANN_GARDEN_ID),
    supabase
      .from("task_instances")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("year", { ascending: true })
      .order("month", { ascending: true })
      .order("due_start_date", { ascending: true }),
    supabase
      .from("diary_entries")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("diary_entry_tags").select("*"),
    supabase.from("tags").select("*").eq("type", "diary").order("name", { ascending: true }),
  ]);

  const results = [
    areasResult,
    plantsResult,
    photosResult,
    profilesResult,
    categoriesResult,
    tasksResult,
    taskInstancesResult,
    diaryEntriesResult,
    diaryEntryTagsResult,
    tagsResult,
  ];
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  const areaRows = areasResult.data ?? [];
  const areaRow = areaRows.find((area) => area.id === areaId && !area.archived_at);

  if (!areaRow) {
    return null;
  }

  const plantRows = plantsResult.data ?? [];
  const activePlantRows = plantRows.filter((plant) => !plant.archived_at);
  const areaPlantRows = activePlantRows.filter((plant) => plant.primary_area_id === areaId);
  const areaPlantIds = new Set(areaPlantRows.map((plant) => plant.id));
  const photoRows = photosResult.data ?? [];
  const plantCountByAreaId = countPlantsByAreaId(plantRows);
  const [areaPhotoById, plantPhotoById] = await Promise.all([
    orientationPhotoByParentId(photoRows, "area_id"),
    orientationPhotoByParentId(photoRows, "plant_id"),
  ]);
  const activeAreas = areaRows
    .filter((area) => !area.archived_at)
    .map((area) =>
      mapArea(area, plantCountByAreaId.get(area.id) ?? 0, areaPhotoById.get(area.id)),
    );
  const area = mapArea(
    areaRow,
    plantCountByAreaId.get(areaRow.id) ?? 0,
    areaPhotoById.get(areaRow.id),
  );
  const areaPlants = areaPlantRows.map((plant) =>
    mapPlant(plant, plantPhotoById.get(plant.id)),
  );
  const activeTaskCategories = (categoriesResult.data ?? []).filter(
    (category) => category.type === "task",
  );
  const diaryTags = tagsResult.data ?? [];
  const profileRows = profilesResult.data ?? [];
  const taskRows = tasksResult.data ?? [];
  const taskInstanceRows = taskInstancesResult.data ?? [];
  const diaryRows = diaryEntriesResult.data ?? [];
  const profileById = new Map(profileRows.map((profile) => [profile.id, profile]));
  const categoryById = new Map(activeTaskCategories.map((category) => [category.id, category]));
  const taskById = new Map(taskRows.map((task) => [task.id, task]));
  const plantById = new Map(activePlantRows.map((plant) => [plant.id, plant]));
  const relatedTaskIds = new Set(
    taskRows
      .filter(
        (task) =>
          !task.archived_at &&
          !task.is_hidden &&
          (task.area_id === areaId || Boolean(task.plant_id && areaPlantIds.has(task.plant_id))),
      )
      .map((task) => task.id),
  );
  const tasks = taskInstanceRows
    .map((instance) => {
      const task = taskById.get(instance.task_id);

      if (!task || !relatedTaskIds.has(task.id)) {
        return null;
      }

      return mapWorkspaceTask({
        area,
        assignedProfile: instance.assigned_to
          ? profileById.get(instance.assigned_to)
          : undefined,
        category: task.category_id ? categoryById.get(task.category_id) : undefined,
        instance,
        task,
      });
    })
    .filter((task): task is GardenTask => Boolean(task))
    .filter((task) => task.section !== "history")
    .sort(sortWorkspaceTasks)
    .slice(0, 6);
  const tagsByEntryId = groupDiaryTagsByEntryId(
    diaryEntryTagsResult.data ?? [],
    diaryTags,
  );
  const diaryEntries = diaryRows
    .filter(
      (entry) =>
        entry.area_id === areaId ||
        Boolean(entry.plant_id && areaPlantIds.has(entry.plant_id)),
    )
    .slice(0, 4)
    .map((entry) =>
      mapWorkspaceDiaryEntry({
        areaName: area.name,
        entry,
        plant: entry.plant_id ? plantById.get(entry.plant_id) : undefined,
        profile: entry.created_by ? profileById.get(entry.created_by) : undefined,
        tags: tagsByEntryId.get(entry.id) ?? [],
        task: getTaskForDiaryEntry(entry, taskInstanceRows, taskById),
      }),
    );
  const photos = await Promise.all(
    photoRows
      .filter(
        (photo) =>
          photo.area_id === areaId ||
          Boolean(photo.plant_id && areaPlantIds.has(photo.plant_id)),
      )
      .slice(0, 6)
      .map((photo) =>
        mapWorkspacePhoto({
          areaName: area.name,
          photo,
          plant: photo.plant_id ? plantById.get(photo.plant_id) : undefined,
          profile: photo.uploaded_by ? profileById.get(photo.uploaded_by) : undefined,
          task: getTaskForPhoto(photo, taskInstanceRows, taskById),
        }),
      ),
  );

  return {
    activeAreas,
    area,
    diaryEntries,
    diaryFormOptions: {
      areas: mapWorkspaceOptions(activeAreas, "name"),
      plants: mapWorkspaceOptions(areaPlants, "commonName"),
      profiles: mapWorkspaceOptions(profileRows, "display_name"),
      tags: mapWorkspaceOptions(diaryTags, "name"),
      tasks: mapTaskInstanceOptions(taskInstanceRows, taskById),
    },
    photoFormOptions: {
      areas: mapWorkspaceOptions(activeAreas, "name"),
      diaryEntries: diaryRows.map((entry) => ({
        id: entry.id,
        name: entry.title ?? entry.quick_note.slice(0, 48),
      })),
      plants: mapWorkspaceOptions(areaPlants, "commonName"),
      profiles: mapWorkspaceOptions(profileRows, "display_name"),
      tasks: mapTaskInstanceOptions(taskInstanceRows, taskById),
    },
    photos,
    plants: areaPlants,
    taskFormOptions: {
      areas: mapWorkspaceOptions(activeAreas, "name"),
      categories: mapWorkspaceOptions(activeTaskCategories, "name", formatName),
      plants: mapWorkspaceOptions(areaPlants, "commonName"),
      profiles: mapWorkspaceOptions(profileRows, "display_name"),
    },
    tasks,
  };
}

function countPlantsByAreaId(plants: PlantRow[]) {
  return plants.reduce((counts, plant) => {
    if (!plant.primary_area_id || plant.archived_at) {
      return counts;
    }

    counts.set(plant.primary_area_id, (counts.get(plant.primary_area_id) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

function mapWorkspaceTask({
  area,
  assignedProfile,
  category,
  instance,
  task,
}: {
  area: GardenAreaRecord;
  assignedProfile?: ProfileRow;
  category?: CategoryRow;
  instance: TaskInstanceRow;
  task: TaskRow;
}): GardenTask {
  const status = displayWorkspaceStatus(instance);
  const section = getWorkspaceTaskSection(instance, status);

  return {
    id: instance.id,
    instanceId: instance.id,
    taskId: task.id,
    title: task.title,
    description: task.description ?? "No description recorded yet.",
    whyItMatters: task.why_it_matters ?? "No extra guidance recorded yet.",
    category: category ? formatName(category.name) : "Task",
    priority: task.priority as TaskPriority,
    status,
    storedStatus: instance.status as TaskStatus,
    section,
    month: monthName(instance.month),
    timingWindow: task.timing_window as TimingWindow,
    dueLabel: formatWorkspaceDueLabel(instance, status, section),
    areaId: task.area_id ?? area.id,
    plantId: task.plant_id ?? undefined,
    assignedTo: assignedProfile?.display_name,
    assignedToId: instance.assigned_to ?? undefined,
    estimatedMinutes: task.estimated_minutes ?? undefined,
    toolsNeeded: task.tools_needed ?? undefined,
    weatherWarning: task.weather_warning ?? undefined,
    safetyWarning: task.safety_warning ?? undefined,
    wildlifeWarning: task.wildlife_warning ?? undefined,
    dueStartDate: instance.due_start_date ?? undefined,
    dueEndDate: instance.due_end_date ?? undefined,
    postponedUntil: instance.postponed_until ?? undefined,
  };
}

function displayWorkspaceStatus(instance: TaskInstanceRow): TaskStatus {
  const status = instance.status as TaskStatus;

  if (completedTaskStatuses.has(status) || status === "partial" || status === "postponed") {
    return status;
  }

  return isWorkspaceOverdue(instance) ? "overdue" : status;
}

function getWorkspaceTaskSection(
  instance: TaskInstanceRow,
  status: TaskStatus,
): TaskSection {
  const storedStatus = instance.status as TaskStatus;

  if (completedTaskStatuses.has(storedStatus)) {
    return "history";
  }

  if (status === "overdue") {
    return "overdue";
  }

  if (isWorkspacePostponedForLater(instance)) {
    return "upcoming";
  }

  return isWorkspaceCurrentMonth(instance) ? "this_month" : "upcoming";
}

function isWorkspaceCurrentMonth(instance: TaskInstanceRow) {
  const today = todayParts();
  return instance.year === today.year && instance.month === today.month;
}

function isWorkspaceOverdue(instance: TaskInstanceRow) {
  const status = instance.status as TaskStatus;

  if (completedTaskStatuses.has(status) || isWorkspacePostponedForLater(instance)) {
    return false;
  }

  const endDate = instance.postponed_until ?? instance.due_end_date;
  return Boolean(endDate && endDate < todayIsoDate());
}

function isWorkspacePostponedForLater(instance: TaskInstanceRow) {
  return (
    instance.status === "postponed" &&
    Boolean(instance.postponed_until && instance.postponed_until >= todayIsoDate())
  );
}

function sortWorkspaceTasks(a: GardenTask, b: GardenTask) {
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

  const priorityDifference = priorityRank(b.priority) - priorityRank(a.priority);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return (a.dueStartDate ?? "").localeCompare(b.dueStartDate ?? "");
}

function priorityRank(priority: TaskPriority) {
  return { low: 1, medium: 2, high: 3 }[priority];
}

function formatWorkspaceDueLabel(
  instance: TaskInstanceRow,
  status: TaskStatus,
  section: TaskSection,
) {
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

  if (isWorkspaceDueNow(instance)) {
    return "Due now";
  }

  return `Due ${timingWindowLabel(instance)} ${monthName(instance.month)}`;
}

function isWorkspaceDueNow(instance: TaskInstanceRow) {
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

function mapWorkspaceDiaryEntry({
  areaName,
  entry,
  plant,
  profile,
  tags,
  task,
}: {
  areaName: string;
  entry: DiaryEntryRow;
  plant?: PlantRow;
  profile?: ProfileRow;
  tags: string[];
  task?: TaskRow;
}): DiaryEntry {
  return {
    id: entry.id,
    title: entry.title ?? "Garden note",
    quickNote: entry.quick_note,
    entryDate: formatDate(entry.entry_date),
    createdBy: profile?.display_name ?? "Unknown",
    areaId: entry.area_id ?? undefined,
    areaName,
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
  };
}

function groupDiaryTagsByEntryId(entryTags: DiaryEntryTagRow[], tags: TagRow[]) {
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

function getTaskForDiaryEntry(
  entry: DiaryEntryRow,
  taskInstances: TaskInstanceRow[],
  taskById: Map<string, TaskRow>,
) {
  if (!entry.task_instance_id) {
    return undefined;
  }

  const instance = taskInstances.find((item) => item.id === entry.task_instance_id);
  return instance ? taskById.get(instance.task_id) : undefined;
}

function getTaskForPhoto(
  photo: PhotoRow,
  taskInstances: TaskInstanceRow[],
  taskById: Map<string, TaskRow>,
) {
  if (!photo.task_instance_id) {
    return undefined;
  }

  const instance = taskInstances.find((item) => item.id === photo.task_instance_id);
  return instance ? taskById.get(instance.task_id) : undefined;
}

async function mapWorkspacePhoto({
  areaName,
  photo,
  plant,
  profile,
  task,
}: {
  areaName: string;
  photo: PhotoRow;
  plant?: PlantRow;
  profile?: ProfileRow;
  task?: TaskRow;
}): Promise<GardenPhoto> {
  return {
    id: photo.id,
    areaId: photo.area_id ?? undefined,
    areaName,
    caption: photo.caption ?? "Garden photo",
    comparisonGroupId: photo.comparison_group_id ?? undefined,
    diaryEntryId: photo.diary_entry_id ?? undefined,
    imageUrl: photo.storage_path ? await signedUrl(photo.storage_path) : undefined,
    plantId: photo.plant_id ?? undefined,
    plantName: plant?.common_name,
    samePositionNote: photo.same_position_note ?? undefined,
    storagePath: photo.storage_path ?? undefined,
    tags: photo.tags,
    takenAt: formatDate(photo.taken_at),
    takenAtValue: photo.taken_at,
    taskId: photo.task_instance_id ?? undefined,
    taskName: task?.title,
    uploadedAt: photo.uploaded_at,
    uploadedBy: profile?.display_name ?? "Unknown",
    uploadedById: photo.uploaded_by ?? undefined,
  };
}

function mapTaskInstanceOptions(
  taskInstances: TaskInstanceRow[],
  taskById: Map<string, TaskRow>,
) {
  return taskInstances
    .map((instance) => {
      const task = taskById.get(instance.task_id);
      return task
        ? {
            id: instance.id,
            name: `${task.title} (${monthName(instance.month)})`,
          }
        : null;
    })
    .filter((option): option is { id: string; name: string } => Boolean(option));
}

function mapWorkspaceOptions<T extends { id: string }, K extends keyof T>(
  rows: T[],
  key: K,
  formatter: (value: string) => string = (value) => value,
) {
  return rows.map((row) => ({
    id: row.id,
    name: formatter(String(row[key])),
  }));
}

function formatName(name: string) {
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

function mapArea(
  area: GardenAreaRow,
  plantCount: number,
  orientationPhoto?: GardenOrientationPhoto,
): GardenAreaRecord {
  return {
    id: area.id,
    name: area.name,
    description: area.description ?? "No description yet.",
    sunlight: area.sunlight ?? "Light notes not recorded yet.",
    soil: [area.soil_type, area.soil_ph].filter(Boolean).join(", ") || "Soil notes not recorded yet.",
    drainage: area.drainage ?? "Drainage notes not recorded yet.",
    microclimate: area.microclimate_notes ?? "Microclimate notes not recorded yet.",
    plantCount,
    activeTaskCount: 0,
    orientationPhoto,
    archivedAt: area.archived_at,
    displayOrder: area.display_order,
    descriptionValue: area.description,
    sunlightValue: area.sunlight,
    soilTypeValue: area.soil_type,
    soilPhValue: area.soil_ph,
    drainageValue: area.drainage,
    moistureNotesValue: area.moisture_notes,
    microclimateNotesValue: area.microclimate_notes,
  };
}

function mapPlant(
  plant: PlantRow,
  orientationPhoto?: GardenOrientationPhoto,
): PlantRecord {
  return {
    id: plant.id,
    commonName: plant.common_name,
    latinName: plant.latin_name ?? undefined,
    cultivar: plant.cultivar ?? undefined,
    plantType: plant.plant_type ?? "Plant",
    areaId: plant.primary_area_id ?? undefined,
    datePlanted: plant.date_planted ?? undefined,
    expectedHeight: plant.expected_height ?? undefined,
    expectedSpread: plant.expected_spread ?? undefined,
    pruningNotes: plant.pruning_notes ?? undefined,
    wateringNotes: plant.watering_notes ?? undefined,
    feedingNotes: plant.feeding_notes ?? undefined,
    soilPreference: plant.soil_preference ?? undefined,
    sunPreference: plant.sun_preference ?? undefined,
    pestDiseaseRisks: plant.pest_disease_risks ?? undefined,
    floweringPeriod: plant.flowering_period ?? undefined,
    fruitingPeriod: plant.fruiting_period ?? undefined,
    healthStatus: plant.health_status as PlantHealthStatus,
    notes: plant.general_notes ?? "No notes recorded yet.",
    isUnknown: plant.is_unknown,
    orientationPhoto,
    archivedAt: plant.archived_at,
    status: plant.status,
    generalNotesValue: plant.general_notes,
  };
}

async function orientationPhotoByParentId(
  photos: PhotoRow[],
  key: "area_id" | "plant_id",
) {
  const firstPhotos = photos.reduce((selected, photo) => {
    const parentId = photo[key];

    if (!parentId || !photo.storage_path || selected.has(parentId)) {
      return selected;
    }

    selected.set(parentId, photo);
    return selected;
  }, new Map<string, PhotoRow>());

  const entries = await Promise.all(
    Array.from(firstPhotos).map(async ([parentId, photo]) => {
      const imageUrl = photo.storage_path
        ? await signedUrl(photo.storage_path)
        : undefined;

      if (!imageUrl) {
        return null;
      }

      return [
        parentId,
        {
          imageUrl,
          caption: photo.caption ?? "Garden photo",
        },
      ] as const;
    }),
  );

  return new Map(entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)));
}

async function signedUrl(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    return undefined;
  }

  return data.signedUrl;
}
