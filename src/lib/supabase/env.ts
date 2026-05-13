type PublicSupabaseEnv = {
  url: string;
  publishableKey: string;
};

type ServerSupabaseEnv = PublicSupabaseEnv & {
  secretKey: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getServerSupabaseEnv(): ServerSupabaseEnv {
  return {
    ...getPublicSupabaseEnv(),
    secretKey: requireEnv("SUPABASE_SECRET_KEY"),
  };
}
