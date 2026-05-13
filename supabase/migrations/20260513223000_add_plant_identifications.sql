create table public.plant_identifications (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  plant_id uuid references public.plants(id) on delete set null,
  area_id uuid references public.garden_areas(id) on delete set null,
  photo_id uuid references public.photos(id) on delete set null,
  requested_by uuid references public.profiles(id) on delete set null,
  image_storage_path text,
  original_filename text,
  model text not null,
  status text not null default 'suggested'
    check (status in ('suggested', 'applied', 'discarded')),
  common_name text,
  latin_name text,
  genus text,
  species text,
  cultivar text,
  plant_type text,
  confidence text not null default 'unknown'
    check (confidence in ('low', 'medium', 'high', 'unknown')),
  confidence_notes text,
  identifying_features text[] not null default '{}',
  care_summary text,
  rhs_notes text,
  warnings text[] not null default '{}',
  suggested_plant_notes text,
  rhs_sources jsonb not null default '[]'::jsonb,
  raw_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  applied_at timestamptz
);

create index plant_identifications_garden_created_idx
  on public.plant_identifications(garden_id, created_at desc);
create index plant_identifications_plant_id_idx
  on public.plant_identifications(plant_id);
create index plant_identifications_area_id_idx
  on public.plant_identifications(area_id);
create index plant_identifications_photo_id_idx
  on public.plant_identifications(photo_id);
create index plant_identifications_status_idx
  on public.plant_identifications(status);

alter table public.plant_identifications enable row level security;

comment on table public.plant_identifications is 'AI-assisted plant identification suggestions reviewed before being applied to plant records.';
comment on column public.plant_identifications.rhs_notes is 'Short RHS-style care notes generated for review; not a substitute for professional or live RHS advice.';
comment on column public.plant_identifications.rhs_sources is 'Optional RHS source URLs returned by the model when web search finds supporting pages.';
