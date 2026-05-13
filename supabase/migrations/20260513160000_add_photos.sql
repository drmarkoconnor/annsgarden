insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'garden-photos',
  'garden-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  storage_path text,
  thumbnail_path text,
  original_storage_path text,
  caption text,
  taken_at date not null default current_date,
  uploaded_at timestamptz not null default now(),
  area_id uuid references public.garden_areas(id) on delete set null,
  plant_id uuid references public.plants(id) on delete set null,
  task_instance_id uuid references public.task_instances(id) on delete set null,
  diary_entry_id uuid references public.diary_entries(id) on delete set null,
  pest_disease_issue_id uuid,
  tags text[] not null default '{}',
  same_position_note text,
  comparison_group_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index photos_garden_taken_idx on public.photos(garden_id, taken_at desc);
create index photos_area_id_idx on public.photos(area_id);
create index photos_plant_id_idx on public.photos(plant_id);
create index photos_task_instance_id_idx on public.photos(task_instance_id);
create index photos_diary_entry_id_idx on public.photos(diary_entry_id);
create index photos_comparison_group_idx on public.photos(comparison_group_id);
create index photos_tags_idx on public.photos using gin(tags);

create trigger set_photos_updated_at
before update on public.photos
for each row execute function public.set_updated_at();

alter table public.photos enable row level security;

comment on table public.photos is 'Phase 7 photo records linked to Supabase Storage and garden context.';
comment on column public.photos.storage_path is 'Private Supabase Storage object path in the garden-photos bucket.';
comment on column public.photos.comparison_group_id is 'Optional plain label for grouping same-position or before/after photos.';
