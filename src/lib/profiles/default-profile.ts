import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ClaimsLike = {
  email?: unknown;
};

export async function defaultProfileIdForClaims(
  supabase: SupabaseClient<Database>,
  claims: ClaimsLike,
) {
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;

  if (!email) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.id ?? null;
}
