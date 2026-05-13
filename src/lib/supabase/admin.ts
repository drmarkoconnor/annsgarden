import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

export function createSupabaseAdminClient() {
  const { url, secretKey } = getServerSupabaseEnv();

  return createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
    },
  });
}
