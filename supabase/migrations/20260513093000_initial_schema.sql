create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  role text not null check (role in ('owner', 'gardener', 'helper')),
  email text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.gardens (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location_label text not null,
  country text not null default 'England',
  region text,
  nearest_city text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.garden_areas (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  name text not null,
  description text,
  sunlight text,
  soil_type text,
  soil_ph text,
  drainage text,
  moisture_notes text,
  microclimate_notes text,
  display_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (garden_id, name)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('plant', 'task', 'diary', 'photo')),
  icon text,
  colour_token text,
  display_order integer not null default 0,
  is_default boolean not null default false,
  archived_at timestamptz,
  unique (type, name)
);

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  primary_area_id uuid references public.garden_areas(id) on delete set null,
  common_name text not null,
  latin_name text,
  cultivar text,
  plant_type text,
  status text not null default 'active'
    check (status in ('active', 'removed', 'dead', 'unknown')),
  health_status text not null default 'unknown'
    check (health_status in ('thriving', 'okay', 'needs_attention', 'struggling', 'unknown')),
  date_planted date,
  expected_height text,
  expected_spread text,
  pruning_notes text,
  watering_notes text,
  feeding_notes text,
  soil_preference text,
  sun_preference text,
  pest_disease_risks text,
  flowering_period text,
  fruiting_period text,
  general_notes text,
  is_unknown boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index garden_areas_garden_id_idx on public.garden_areas(garden_id);
create index garden_areas_display_order_idx on public.garden_areas(display_order);
create index categories_type_display_order_idx on public.categories(type, display_order);
create index plants_garden_id_idx on public.plants(garden_id);
create index plants_primary_area_id_idx on public.plants(primary_area_id);
create index plants_health_status_idx on public.plants(health_status);

create trigger set_garden_areas_updated_at
before update on public.garden_areas
for each row execute function public.set_updated_at();

create trigger set_plants_updated_at
before update on public.plants
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.gardens enable row level security;
alter table public.garden_areas enable row level security;
alter table public.categories enable row level security;
alter table public.plants enable row level security;

comment on table public.profiles is 'Phase 3 profile records for Ann, Mark and Alicia. Not wired to auth yet.';
comment on table public.gardens is 'The shared garden record for Ann''s Garden.';
comment on table public.garden_areas is 'Named physical areas of Ann''s one-acre garden.';
comment on table public.categories is 'Default category labels for later plants, tasks, diary and photos.';
comment on table public.plants is 'Initial plant records. Real CRUD arrives in Phase 4.';
