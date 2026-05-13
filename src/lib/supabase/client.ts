import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createClient<Database>(url, publishableKey);
}
