import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ClaimsLike = {
  email?: unknown;
};
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

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

  if (data?.id) {
    return data.id;
  }

  const profile = profileFromEmail(email);
  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .insert(profile)
    .select("id")
    .single();

  if (!createError) {
    return createdProfile.id;
  }

  if (createError.code !== "23505") {
    return null;
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  return existingProfile?.id ?? null;
}

function profileFromEmail(email: string): ProfileInsert {
  if (email.includes("ann")) {
    return {
      display_name: "Ann",
      email,
      role: "owner" as const,
    };
  }

  if (email.includes("alicia")) {
    return {
      display_name: "Alicia",
      email,
      role: "gardener" as const,
    };
  }

  if (email.includes("mark")) {
    return {
      display_name: "Mark",
      email,
      role: "helper" as const,
    };
  }

  return {
    display_name: email.split("@")[0] ?? "Garden user",
    email,
    role: "helper" as const,
  };
}
