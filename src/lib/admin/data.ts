import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileRecord = ProfileRow;
export type CategoryRecord = CategoryRow;

export type AdminData = {
  activeCategories: CategoryRecord[];
  archivedCategories: CategoryRecord[];
  profiles: ProfileRecord[];
};

export async function getAdminData(): Promise<AdminData> {
  const supabase = createSupabaseAdminClient();
  const [profilesResult, categoriesResult] = await Promise.all([
    supabase.from("profiles").select("*").order("display_name", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .order("type", { ascending: true })
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  const categories = categoriesResult.data ?? [];

  return {
    activeCategories: categories.filter((category) => !category.archived_at),
    archivedCategories: categories.filter((category) => category.archived_at),
    profiles: profilesResult.data ?? [],
  };
}
