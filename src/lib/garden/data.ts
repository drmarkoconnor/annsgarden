import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import type { Database } from "@/lib/supabase/database.types";
import type {
  GardenArea,
  GardenOrientationPhoto,
  Plant,
  PlantHealthStatus,
} from "@/types/garden";

type GardenRow = Database["public"]["Tables"]["gardens"]["Row"];
type GardenAreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
type PhotoRow = Database["public"]["Tables"]["photos"]["Row"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];

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

function countPlantsByAreaId(plants: PlantRow[]) {
  return plants.reduce((counts, plant) => {
    if (!plant.primary_area_id || plant.archived_at) {
      return counts;
    }

    counts.set(plant.primary_area_id, (counts.get(plant.primary_area_id) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
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
