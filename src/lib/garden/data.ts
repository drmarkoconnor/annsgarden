import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import type { Database } from "@/lib/supabase/database.types";
import type { GardenArea, Plant, PlantHealthStatus } from "@/types/garden";

type GardenRow = Database["public"]["Tables"]["gardens"]["Row"];
type GardenAreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
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

  const [gardenResult, areasResult, plantsResult] = await Promise.all([
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

  const rows = areasResult.data ?? [];
  const plantRows = plantsResult.data ?? [];
  const plantCountByAreaId = countPlantsByAreaId(plantRows);
  const areaNameById = new Map(rows.map((area) => [area.id, area.name]));
  const areas = rows.map((area) => mapArea(area, plantCountByAreaId.get(area.id) ?? 0));
  const plants = plantRows.map(mapPlant);

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

function mapArea(area: GardenAreaRow, plantCount: number): GardenAreaRecord {
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

function mapPlant(plant: PlantRow): PlantRecord {
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
    archivedAt: plant.archived_at,
    status: plant.status,
    generalNotesValue: plant.general_notes,
  };
}
