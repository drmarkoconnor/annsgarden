create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  title text not null,
  description text,
  why_it_matters text,
  category_id uuid references public.categories(id) on delete set null,
  plant_id uuid references public.plants(id) on delete set null,
  area_id uuid references public.garden_areas(id) on delete set null,
  task_type text not null default 'maintenance'
    check (task_type in ('maintenance', 'planting', 'pruning', 'watering', 'feeding', 'mulching', 'inspection', 'pest_watch', 'diary_follow_up', 'repair', 'custom')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  recurrence_type text not null default 'one_off'
    check (recurrence_type in ('one_off', 'annual', 'monthly', 'custom')),
  month integer check (month between 1 and 12),
  timing_window text not null default 'all_month'
    check (timing_window in ('early_month', 'mid_month', 'late_month', 'all_month', 'specific_date')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  difficulty text,
  tools_needed text[],
  weather_warning text,
  safety_warning text,
  wildlife_warning text,
  guidance_url text,
  is_default boolean not null default false,
  is_hidden boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_instances (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  due_start_date date,
  due_end_date date,
  status text not null default 'not_started'
    check (status in ('not_started', 'done', 'partial', 'postponed', 'skipped', 'not_applicable', 'overdue')),
  assigned_to uuid references public.profiles(id) on delete set null,
  postponed_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (task_id, year, month)
);

create table public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_instance_id uuid not null references public.task_instances(id) on delete cascade,
  completed_by uuid references public.profiles(id) on delete set null,
  status text not null
    check (status in ('not_started', 'done', 'partial', 'postponed', 'skipped', 'not_applicable', 'overdue')),
  completed_at timestamptz not null default now(),
  note text,
  time_spent_minutes integer check (time_spent_minutes is null or time_spent_minutes > 0),
  skip_reason text,
  postpone_reason text,
  follow_up_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now()
);

create index tasks_garden_id_idx on public.tasks(garden_id);
create index tasks_category_id_idx on public.tasks(category_id);
create index tasks_area_id_idx on public.tasks(area_id);
create index tasks_plant_id_idx on public.tasks(plant_id);
create index tasks_month_idx on public.tasks(month);
create index task_instances_garden_month_idx on public.task_instances(garden_id, year, month);
create index task_instances_status_idx on public.task_instances(status);
create index task_instances_due_end_date_idx on public.task_instances(due_end_date);
create index task_completions_instance_idx on public.task_completions(task_instance_id);
create index task_completions_completed_at_idx on public.task_completions(completed_at desc);

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger set_task_instances_updated_at
before update on public.task_instances
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.task_instances enable row level security;
alter table public.task_completions enable row level security;

comment on table public.tasks is 'Phase 5 task templates and custom task records for Ann''s garden.';
comment on table public.task_instances is 'Monthly task occurrences with status, assignment and due windows.';
comment on table public.task_completions is 'History of task outcomes and notes.';

insert into public.categories (id, name, type, icon, colour_token, display_order, is_default)
values
  ('00000000-0000-4000-8000-000000000313', 'pruning', 'task', 'scissors', 'rose', 130, true),
  ('00000000-0000-4000-8000-000000000314', 'watering', 'task', 'droplets', 'sky', 140, true),
  ('00000000-0000-4000-8000-000000000315', 'mulching', 'task', 'layers', 'amber', 150, true),
  ('00000000-0000-4000-8000-000000000316', 'bulbs', 'task', 'flower', 'violet', 160, true),
  ('00000000-0000-4000-8000-000000000317', 'diary follow-up', 'task', 'notebook', 'teal', 170, true),
  ('00000000-0000-4000-8000-000000000318', 'fruit', 'task', 'apple', 'red', 180, true),
  ('00000000-0000-4000-8000-000000000319', 'planting', 'task', 'sprout', 'green', 190, true)
on conflict (type, name) do update set
  icon = excluded.icon,
  colour_token = excluded.colour_token,
  display_order = excluded.display_order,
  is_default = excluded.is_default;

insert into public.tasks (
  id,
  garden_id,
  title,
  description,
  why_it_matters,
  category_id,
  plant_id,
  area_id,
  task_type,
  priority,
  recurrence_type,
  month,
  timing_window,
  estimated_minutes,
  tools_needed,
  safety_warning,
  wildlife_warning,
  is_default,
  created_by
)
values
  (
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000001',
    'Prune roses',
    'Check the shrub roses and remove dead, crossing or weak stems.',
    'A clean, open shape improves airflow and keeps flowering strong.',
    '00000000-0000-4000-8000-000000000313',
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000204',
    'pruning',
    'high',
    'annual',
    5,
    'early_month',
    45,
    array['Secateurs', 'Gloves', 'Trug'],
    'Use gloves for thorns and clear prunings from paths.',
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000502',
    '00000000-0000-4000-8000-000000000001',
    'Check box for caterpillar',
    'Look inside the driveway box for webbing, chewed leaves and caterpillars.',
    'Early checks make it easier to limit damage before the hedge looks thin.',
    '00000000-0000-4000-8000-000000000311',
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000207',
    'pest_watch',
    'high',
    'annual',
    5,
    'all_month',
    15,
    array['Gloves', 'Small torch'],
    null,
    'Check carefully before disturbing dense growth.',
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000503',
    '00000000-0000-4000-8000-000000000001',
    'Mulch ericaceous border',
    'Top up mulch around the rhododendron and other acid-loving shrubs.',
    'Mulch helps the sheltered south border hold moisture as the weather warms.',
    '00000000-0000-4000-8000-000000000315',
    '00000000-0000-4000-8000-000000000405',
    '00000000-0000-4000-8000-000000000201',
    'mulching',
    'medium',
    'annual',
    5,
    'all_month',
    40,
    array['Ericaceous mulch', 'Bucket', 'Hand fork'],
    null,
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000504',
    '00000000-0000-4000-8000-000000000001',
    'Check containers for dry compost',
    'Lift a few pots and check compost below the surface, especially on the patio.',
    'Containers can dry out quickly even when the beds still look damp.',
    '00000000-0000-4000-8000-000000000314',
    null,
    '00000000-0000-4000-8000-000000000209',
    'watering',
    'high',
    'monthly',
    5,
    'all_month',
    20,
    array['Watering can'],
    null,
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000505',
    '00000000-0000-4000-8000-000000000001',
    'Plant tulip bulbs',
    'Plan tulip positions for containers and sunny border gaps.',
    'A note now helps autumn bulb planting fill the right spring gaps.',
    '00000000-0000-4000-8000-000000000316',
    null,
    '00000000-0000-4000-8000-000000000209',
    'planting',
    'medium',
    'annual',
    11,
    'late_month',
    60,
    array['Bulbs', 'Trowel', 'Labels'],
    null,
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000506',
    '00000000-0000-4000-8000-000000000001',
    'Check plum tree for plum moth',
    'Inspect young fruit on the Victoria plum and note any early damage.',
    'Recording problems early helps Ann compare this year with last year''s crop.',
    '00000000-0000-4000-8000-000000000318',
    '00000000-0000-4000-8000-000000000404',
    '00000000-0000-4000-8000-000000000205',
    'pest_watch',
    'high',
    'annual',
    5,
    'mid_month',
    20,
    null,
    null,
    'Avoid disturbing nests in nearby hedging.',
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000507',
    '00000000-0000-4000-8000-000000000001',
    'Record flowering gaps in south-facing border',
    'Make a quick note of any dull patches between spring and early summer flowers.',
    'This turns a fleeting observation into a useful autumn planting plan.',
    '00000000-0000-4000-8000-000000000317',
    null,
    '00000000-0000-4000-8000-000000000204',
    'diary_follow_up',
    'medium',
    'one_off',
    5,
    'late_month',
    10,
    null,
    null,
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000508',
    '00000000-0000-4000-8000-000000000001',
    'Turn compost',
    'Turn the active compost bay and check whether it is too dry.',
    'A quick turn keeps the lower field compost moving for summer mulching.',
    '00000000-0000-4000-8000-000000000309',
    null,
    '00000000-0000-4000-8000-000000000206',
    'maintenance',
    'low',
    'monthly',
    5,
    'late_month',
    30,
    array['Fork', 'Gloves'],
    null,
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000509',
    '00000000-0000-4000-8000-000000000001',
    'Check hostas for slug damage',
    'Look for fresh holes and slime trails in the shady borders.',
    'Small checks help protect new leaves before the plants look ragged.',
    '00000000-0000-4000-8000-000000000311',
    '00000000-0000-4000-8000-000000000403',
    '00000000-0000-4000-8000-000000000202',
    'pest_watch',
    'medium',
    'annual',
    5,
    'early_month',
    15,
    null,
    null,
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  ),
  (
    '00000000-0000-4000-8000-000000000510',
    '00000000-0000-4000-8000-000000000001',
    'Edge main lawn path',
    'Tidy the soft edge where the main lawn meets the sunny border.',
    'A crisp edge helps the big lawn feel intentional without much fuss.',
    '00000000-0000-4000-8000-000000000304',
    null,
    '00000000-0000-4000-8000-000000000203',
    'maintenance',
    'low',
    'monthly',
    5,
    'mid_month',
    25,
    null,
    null,
    null,
    true,
    '00000000-0000-4000-8000-000000000101'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  why_it_matters = excluded.why_it_matters,
  category_id = excluded.category_id,
  plant_id = excluded.plant_id,
  area_id = excluded.area_id,
  task_type = excluded.task_type,
  priority = excluded.priority,
  recurrence_type = excluded.recurrence_type,
  month = excluded.month,
  timing_window = excluded.timing_window,
  estimated_minutes = excluded.estimated_minutes,
  tools_needed = excluded.tools_needed,
  safety_warning = excluded.safety_warning,
  wildlife_warning = excluded.wildlife_warning,
  is_default = excluded.is_default,
  created_by = excluded.created_by;

insert into public.task_instances (
  id,
  task_id,
  garden_id,
  year,
  month,
  due_start_date,
  due_end_date,
  status,
  assigned_to,
  postponed_until
)
values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-01', '2026-05-10', 'not_started', '00000000-0000-4000-8000-000000000103', null),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-01', '2026-05-31', 'not_started', '00000000-0000-4000-8000-000000000101', null),
  ('00000000-0000-4000-8000-000000000603', '00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-01', '2026-05-31', 'partial', '00000000-0000-4000-8000-000000000102', null),
  ('00000000-0000-4000-8000-000000000604', '00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-01', '2026-05-31', 'not_started', '00000000-0000-4000-8000-000000000101', null),
  ('00000000-0000-4000-8000-000000000605', '00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000001', 2026, 11, '2026-11-21', '2026-11-30', 'not_started', '00000000-0000-4000-8000-000000000101', null),
  ('00000000-0000-4000-8000-000000000606', '00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-11', '2026-05-20', 'not_started', '00000000-0000-4000-8000-000000000102', null),
  ('00000000-0000-4000-8000-000000000607', '00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-21', '2026-05-31', 'not_started', '00000000-0000-4000-8000-000000000101', null),
  ('00000000-0000-4000-8000-000000000608', '00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-21', '2026-05-31', 'postponed', '00000000-0000-4000-8000-000000000103', '2026-05-25'),
  ('00000000-0000-4000-8000-000000000609', '00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-01', '2026-05-10', 'not_started', '00000000-0000-4000-8000-000000000103', null),
  ('00000000-0000-4000-8000-000000000610', '00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000001', 2026, 5, '2026-05-11', '2026-05-20', 'done', '00000000-0000-4000-8000-000000000102', null)
on conflict (task_id, year, month) do update set
  due_start_date = excluded.due_start_date,
  due_end_date = excluded.due_end_date,
  status = excluded.status,
  assigned_to = excluded.assigned_to,
  postponed_until = excluded.postponed_until;

insert into public.task_completions (
  id,
  task_instance_id,
  completed_by,
  status,
  completed_at,
  note,
  time_spent_minutes
)
values (
  '00000000-0000-4000-8000-000000000701',
  '00000000-0000-4000-8000-000000000610',
  '00000000-0000-4000-8000-000000000102',
  'done',
  '2026-05-09 10:30:00+00',
  'Tidied the edge by the main path; looks sharper now.',
  25
)
on conflict (id) do update set
  completed_by = excluded.completed_by,
  status = excluded.status,
  completed_at = excluded.completed_at,
  note = excluded.note,
  time_spent_minutes = excluded.time_spent_minutes;
