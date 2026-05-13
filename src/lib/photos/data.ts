import "server-only";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type { GardenPhoto } from "@/types/garden";

type AreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
type DiaryEntryRow = Database["public"]["Tables"]["diary_entries"]["Row"];
type PhotoRow = Database["public"]["Tables"]["photos"]["Row"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TaskInstanceRow = Database["public"]["Tables"]["task_instances"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export type PhotoOption = {
  id: string;
  name: string;
};

export type PhotoFormOptions = {
  areas: PhotoOption[];
  diaryEntries: PhotoOption[];
  plants: PhotoOption[];
  profiles: PhotoOption[];
  tasks: PhotoOption[];
};

export type PhotoData = {
  comparisonPhotos: GardenPhoto[];
  formOptions: PhotoFormOptions;
  photos: GardenPhoto[];
};

const signedUrlSeconds = 60 * 60;

export async function getPhotoData(): Promise<PhotoData> {
  const supabase = createSupabaseAdminClient();
  const [
    photosResult,
    areasResult,
    plantsResult,
    profilesResult,
    taskInstancesResult,
    tasksResult,
    diaryEntriesResult,
  ] = await Promise.all([
    supabase
      .from("photos")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("taken_at", { ascending: false })
      .order("uploaded_at", { ascending: false }),
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
    supabase
      .from("diary_entries")
      .select("*")
      .eq("garden_id", ANN_GARDEN_ID)
      .order("entry_date", { ascending: false }),
  ]);

  if (photosResult.error) {
    throw new Error(photosResult.error.message);
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

  if (diaryEntriesResult.error) {
    throw new Error(diaryEntriesResult.error.message);
  }

  const areas = areasResult.data ?? [];
  const plants = plantsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const taskInstances = taskInstancesResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const diaryEntries = diaryEntriesResult.data ?? [];
  const areaById = new Map(areas.map((area) => [area.id, area]));
  const plantById = new Map(plants.map((plant) => [plant.id, plant]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const taskInstanceById = new Map(
    taskInstances.map((instance) => [instance.id, instance]),
  );
  const diaryEntryById = new Map(diaryEntries.map((entry) => [entry.id, entry]));

  const photos = await Promise.all(
    (photosResult.data ?? []).map((photo) =>
      mapPhoto({
        area: photo.area_id ? areaById.get(photo.area_id) : undefined,
        diaryEntry: photo.diary_entry_id
          ? diaryEntryById.get(photo.diary_entry_id)
          : undefined,
        photo,
        plant: photo.plant_id ? plantById.get(photo.plant_id) : undefined,
        profile: photo.uploaded_by ? profileById.get(photo.uploaded_by) : undefined,
        task: getTaskForInstance(photo.task_instance_id, taskInstanceById, taskById),
      }),
    ),
  );

  return {
    comparisonPhotos: chooseComparisonPhotos(photos),
    formOptions: {
      areas: mapOptions(areas, "name"),
      diaryEntries: diaryEntries.map((entry) => ({
        id: entry.id,
        name: entry.title ?? entry.quick_note.slice(0, 48),
      })),
      plants: mapOptions(plants, "common_name"),
      profiles: mapOptions(profiles, "display_name"),
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
        .filter((option): option is PhotoOption => Boolean(option)),
    },
    photos,
  };
}

async function mapPhoto({
  area,
  diaryEntry,
  photo,
  plant,
  profile,
  task,
}: {
  area?: AreaRow;
  diaryEntry?: DiaryEntryRow;
  photo: PhotoRow;
  plant?: PlantRow;
  profile?: ProfileRow;
  task?: TaskRow;
}): Promise<GardenPhoto> {
  return {
    id: photo.id,
    areaId: photo.area_id ?? undefined,
    areaName: area?.name,
    caption: photo.caption ?? "Garden photo",
    comparisonGroupId: photo.comparison_group_id ?? undefined,
    diaryEntryId: photo.diary_entry_id ?? undefined,
    diaryEntryTitle: diaryEntry?.title ?? undefined,
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

async function signedUrl(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(storagePath, signedUrlSeconds);

  if (error) {
    return undefined;
  }

  return data.signedUrl;
}

function chooseComparisonPhotos(photos: GardenPhoto[]) {
  const grouped = photos.reduce((groups, photo) => {
    if (!photo.comparisonGroupId) {
      return groups;
    }

    const current = groups.get(photo.comparisonGroupId) ?? [];
    current.push(photo);
    groups.set(photo.comparisonGroupId, current);
    return groups;
  }, new Map<string, GardenPhoto[]>());

  const sameGroup = Array.from(grouped.values()).find((group) => group.length >= 2);
  return (sameGroup ?? photos).slice(0, 2);
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

function formatDate(value: string) {
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
): PhotoOption[] {
  return rows.map((row) => ({
    id: row.id,
    name: String(row[key]),
  }));
}
