create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'diary'
    check (type in ('diary', 'photo', 'plant', 'task')),
  created_at timestamptz not null default now(),
  unique (type, name)
);

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  entry_date date not null default current_date,
  title text,
  quick_note text not null,
  area_id uuid references public.garden_areas(id) on delete set null,
  plant_id uuid references public.plants(id) on delete set null,
  task_instance_id uuid references public.task_instances(id) on delete set null,
  what_went_well text,
  what_went_badly text,
  what_to_try_next text,
  follow_up_needed boolean not null default false,
  follow_up_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.diary_entry_tags (
  diary_entry_id uuid not null references public.diary_entries(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (diary_entry_id, tag_id)
);

create index diary_entries_garden_date_idx on public.diary_entries(garden_id, entry_date desc);
create index diary_entries_area_id_idx on public.diary_entries(area_id);
create index diary_entries_plant_id_idx on public.diary_entries(plant_id);
create index diary_entries_task_instance_id_idx on public.diary_entries(task_instance_id);
create index diary_entry_tags_tag_id_idx on public.diary_entry_tags(tag_id);
create index tags_type_name_idx on public.tags(type, name);

create trigger set_diary_entries_updated_at
before update on public.diary_entries
for each row execute function public.set_updated_at();

alter table public.tags enable row level security;
alter table public.diary_entries enable row level security;
alter table public.diary_entry_tags enable row level security;

comment on table public.diary_entries is 'Phase 6 quick garden notes with optional reflections and links.';
comment on table public.tags is 'Reusable labels for diary entries now, photos later.';
comment on table public.diary_entry_tags is 'Many-to-many diary entry tag links.';

insert into public.tags (id, name, type)
values
  ('00000000-0000-4000-8000-000000000801', 'watering', 'diary'),
  ('00000000-0000-4000-8000-000000000802', 'pruning', 'diary'),
  ('00000000-0000-4000-8000-000000000803', 'flowering', 'diary'),
  ('00000000-0000-4000-8000-000000000804', 'pest', 'diary'),
  ('00000000-0000-4000-8000-000000000805', 'disease', 'diary'),
  ('00000000-0000-4000-8000-000000000806', 'soil', 'diary'),
  ('00000000-0000-4000-8000-000000000807', 'weather', 'diary'),
  ('00000000-0000-4000-8000-000000000808', 'planting', 'diary'),
  ('00000000-0000-4000-8000-000000000809', 'harvest', 'diary'),
  ('00000000-0000-4000-8000-000000000810', 'repair', 'diary'),
  ('00000000-0000-4000-8000-000000000811', 'lesson learned', 'diary'),
  ('00000000-0000-4000-8000-000000000812', 'mulching', 'diary'),
  ('00000000-0000-4000-8000-000000000813', 'inspection', 'diary')
on conflict (type, name) do update set
  name = excluded.name;

insert into public.diary_entries (
  id,
  garden_id,
  created_by,
  entry_date,
  title,
  quick_note,
  area_id,
  plant_id,
  task_instance_id,
  what_went_well,
  what_went_badly,
  what_to_try_next,
  follow_up_needed
)
values
  (
    '00000000-0000-4000-8000-000000000901',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '2026-05-12',
    'South-facing border has a quiet patch',
    'Gap after the tulips near the wall. Add something light and upright for late May.',
    '00000000-0000-4000-8000-000000000204',
    null,
    '00000000-0000-4000-8000-000000000607',
    null,
    null,
    'Consider alliums or early summer perennials for this position.',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000902',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000103',
    '2026-05-10',
    'Box needs another look',
    'Alicia saw a few chewed leaves by the driveway. No obvious webbing yet.',
    '00000000-0000-4000-8000-000000000207',
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000602',
    null,
    null,
    null,
    false
  ),
  (
    '00000000-0000-4000-8000-000000000903',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000102',
    '2026-05-08',
    'Mulch started',
    'Rhododendron side has been mulched. Need one more bag for the front edge.',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000405',
    '00000000-0000-4000-8000-000000000603',
    'Soil underneath was still cool and damp.',
    null,
    null,
    false
  )
on conflict (id) do update set
  created_by = excluded.created_by,
  entry_date = excluded.entry_date,
  title = excluded.title,
  quick_note = excluded.quick_note,
  area_id = excluded.area_id,
  plant_id = excluded.plant_id,
  task_instance_id = excluded.task_instance_id,
  what_went_well = excluded.what_went_well,
  what_went_badly = excluded.what_went_badly,
  what_to_try_next = excluded.what_to_try_next,
  follow_up_needed = excluded.follow_up_needed;

insert into public.diary_entry_tags (diary_entry_id, tag_id)
values
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000803'),
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000811'),
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000808'),
  ('00000000-0000-4000-8000-000000000902', '00000000-0000-4000-8000-000000000804'),
  ('00000000-0000-4000-8000-000000000902', '00000000-0000-4000-8000-000000000813'),
  ('00000000-0000-4000-8000-000000000903', '00000000-0000-4000-8000-000000000806'),
  ('00000000-0000-4000-8000-000000000903', '00000000-0000-4000-8000-000000000812')
on conflict (diary_entry_id, tag_id) do nothing;
