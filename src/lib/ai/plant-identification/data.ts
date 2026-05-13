import "server-only";
import { ANN_GARDEN_ID } from "@/lib/garden/constants";
import { PHOTO_BUCKET } from "@/lib/photos/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";

type AreaRow = Database["public"]["Tables"]["garden_areas"]["Row"];
type PhotoRow = Database["public"]["Tables"]["photos"]["Row"];
type PlantIdentificationRow =
  Database["public"]["Tables"]["plant_identifications"]["Row"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type PlantIdentificationOption = {
  id: string;
  name: string;
};

export type PlantIdentificationFormOptions = {
  areas: PlantIdentificationOption[];
  plants: PlantIdentificationOption[];
  profiles: PlantIdentificationOption[];
};

export type PlantIdentificationRecord = {
  areaId?: string;
  areaName?: string;
  careSummary?: string;
  commonName: string;
  confidence: PlantIdentificationRow["confidence"];
  confidenceNotes?: string;
  cultivar?: string;
  createdAt: string;
  genus?: string;
  id: string;
  identifyingFeatures: string[];
  imageUrl?: string;
  latinName?: string;
  model: string;
  originalFilename?: string;
  photoId?: string;
  plantId?: string;
  plantName?: string;
  plantType?: string;
  requestedBy?: string;
  requestedById?: string;
  rhsNotes?: string;
  rhsSources: { title: string; url: string }[];
  species?: string;
  status: PlantIdentificationRow["status"];
  suggestedPlantNotes?: string;
  warnings: string[];
};

export type PlantIdentificationData = {
  formOptions: PlantIdentificationFormOptions;
  identifications: PlantIdentificationRecord[];
};

export type PlantIdentificationDetail = PlantIdentificationData & {
  identification: PlantIdentificationRecord;
};

export async function getPlantIdentificationData(): Promise<PlantIdentificationData> {
  const data = await getPlantIdentificationBaseData();

  return {
    formOptions: data.formOptions,
    identifications: await mapIdentifications(data),
  };
}

export async function getPlantIdentificationDetail(
  identificationId: string,
): Promise<PlantIdentificationDetail | null> {
  const data = await getPlantIdentificationBaseData();
  const identifications = await mapIdentifications(data);
  const identification = identifications.find((item) => item.id === identificationId);

  if (!identification) {
    return null;
  }

  return {
    formOptions: data.formOptions,
    identification,
    identifications,
  };
}

async function getPlantIdentificationBaseData() {
  const supabase = createSupabaseAdminClient();
  const [identificationsResult, areasResult, plantsResult, profilesResult, photosResult] =
    await Promise.all([
      supabase
        .from("plant_identifications")
        .select("*")
        .eq("garden_id", ANN_GARDEN_ID)
        .order("created_at", { ascending: false }),
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
        .from("photos")
        .select("*")
        .eq("garden_id", ANN_GARDEN_ID)
        .not("storage_path", "is", null),
    ]);

  const results = [
    identificationsResult,
    areasResult,
    plantsResult,
    profilesResult,
    photosResult,
  ];
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  const areas = areasResult.data ?? [];
  const plants = plantsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  return {
    areas,
    formOptions: {
      areas: mapOptions(areas, "name"),
      plants: mapOptions(plants, "common_name"),
      profiles: mapOptions(profiles, "display_name"),
    },
    identifications: identificationsResult.data ?? [],
    photos: photosResult.data ?? [],
    plants,
    profiles,
  };
}

async function mapIdentifications({
  areas,
  identifications,
  photos,
  plants,
  profiles,
}: {
  areas: AreaRow[];
  identifications: PlantIdentificationRow[];
  photos: PhotoRow[];
  plants: PlantRow[];
  profiles: ProfileRow[];
}) {
  const areaById = new Map(areas.map((area) => [area.id, area]));
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  const plantById = new Map(plants.map((plant) => [plant.id, plant]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  return Promise.all(
    identifications.map(async (identification) => {
      const area = identification.area_id
        ? areaById.get(identification.area_id)
        : undefined;
      const photo = identification.photo_id
        ? photoById.get(identification.photo_id)
        : undefined;
      const imagePath = identification.image_storage_path ?? photo?.storage_path;
      const plant = identification.plant_id
        ? plantById.get(identification.plant_id)
        : undefined;
      const profile = identification.requested_by
        ? profileById.get(identification.requested_by)
        : undefined;

      return {
        areaId: identification.area_id ?? undefined,
        areaName: area?.name,
        careSummary: identification.care_summary ?? undefined,
        commonName: identification.common_name ?? "Unknown plant",
        confidence: identification.confidence,
        confidenceNotes: identification.confidence_notes ?? undefined,
        cultivar: identification.cultivar ?? undefined,
        createdAt: formatDate(identification.created_at),
        genus: identification.genus ?? undefined,
        id: identification.id,
        identifyingFeatures: identification.identifying_features,
        imageUrl: imagePath ? await signedUrl(imagePath) : undefined,
        latinName: identification.latin_name ?? undefined,
        model: identification.model,
        originalFilename: identification.original_filename ?? undefined,
        photoId: identification.photo_id ?? undefined,
        plantId: identification.plant_id ?? undefined,
        plantName: plant?.common_name,
        plantType: identification.plant_type ?? undefined,
        requestedBy: profile?.display_name,
        requestedById: identification.requested_by ?? undefined,
        rhsNotes: identification.rhs_notes ?? undefined,
        rhsSources: parseSources(identification.rhs_sources),
        species: identification.species ?? undefined,
        status: identification.status,
        suggestedPlantNotes: identification.suggested_plant_notes ?? undefined,
        warnings: identification.warnings,
      };
    }),
  );
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

function parseSources(value: Json): { title: string; url: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        return null;
      }

      const title = typeof item.title === "string" ? item.title : "";
      const url = typeof item.url === "string" ? item.url : "";
      return title && url ? { title, url } : null;
    })
    .filter((item): item is { title: string; url: string } => Boolean(item));
}

function mapOptions<T extends { id: string }, K extends keyof T>(
  rows: T[],
  key: K,
): PlantIdentificationOption[] {
  return rows.map((row) => ({
    id: row.id,
    name: String(row[key]),
  }));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
}
