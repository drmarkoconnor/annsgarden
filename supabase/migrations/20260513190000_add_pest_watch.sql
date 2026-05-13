create table public.pest_disease_issues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  issue_type text not null default 'unknown'
    check (issue_type in ('pest', 'disease', 'animal', 'unknown')),
  description text,
  symptoms text,
  affected_plants text,
  likely_months integer[] not null default '{}',
  prevention_note text,
  organic_treatment_note text,
  chemical_caution_note text,
  severity text not null default 'unknown'
    check (severity in ('low', 'medium', 'high', 'unknown')),
  when_to_seek_help text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pest_disease_logs (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  issue_id uuid not null references public.pest_disease_issues(id) on delete restrict,
  plant_id uuid references public.plants(id) on delete set null,
  area_id uuid references public.garden_areas(id) on delete set null,
  observed_by uuid references public.profiles(id) on delete set null,
  observed_at date not null default current_date,
  severity text not null default 'unknown'
    check (severity in ('low', 'medium', 'high', 'unknown')),
  note text,
  follow_up_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now()
);

create index pest_disease_issues_type_idx on public.pest_disease_issues(issue_type);
create index pest_disease_issues_likely_months_idx on public.pest_disease_issues using gin(likely_months);
create index pest_disease_logs_garden_observed_idx on public.pest_disease_logs(garden_id, observed_at desc);
create index pest_disease_logs_issue_id_idx on public.pest_disease_logs(issue_id);
create index pest_disease_logs_area_id_idx on public.pest_disease_logs(area_id);
create index pest_disease_logs_plant_id_idx on public.pest_disease_logs(plant_id);

create trigger set_pest_disease_issues_updated_at
before update on public.pest_disease_issues
for each row execute function public.set_updated_at();

alter table public.pest_disease_issues enable row level security;
alter table public.pest_disease_logs enable row level security;

alter table public.photos
  add constraint photos_pest_disease_issue_id_fkey
  foreign key (pest_disease_issue_id)
  references public.pest_disease_issues(id)
  on delete set null;

comment on table public.pest_disease_issues is 'Phase 9 lightweight pest and disease watch issues for Ann''s garden.';
comment on table public.pest_disease_logs is 'Observed pest and disease notes linked to Ann''s garden, areas and plants.';
comment on column public.pest_disease_issues.external_url is 'Placeholder for later curated external guidance links.';

insert into public.pest_disease_issues (
  id,
  name,
  issue_type,
  description,
  symptoms,
  affected_plants,
  likely_months,
  prevention_note,
  organic_treatment_note,
  chemical_caution_note,
  severity,
  when_to_seek_help
)
values
  (
    '00000000-0000-4000-8000-000000000901',
    'Black spot',
    'disease',
    'Common rose disease to watch in mild, damp spells.',
    'Dark blotches on leaves, yellowing and early leaf drop.',
    'Roses in the south-facing borders and driveway borders.',
    array[5, 6, 7, 8, 9],
    'Keep airflow open, clear fallen leaves and avoid wetting foliage when watering.',
    'Remove badly affected leaves and record whether airflow or pruning needs improving.',
    'Only consider sprays after confirming the problem and reading current label guidance.',
    'medium',
    'If defoliation is heavy or repeats across several seasons.'
  ),
  (
    '00000000-0000-4000-8000-000000000902',
    'Box blight',
    'disease',
    'Fungal disease risk for clipped box, especially in humid weather.',
    'Brown patches, black streaks on stems and rapid leaf loss.',
    'Box in the driveway borders.',
    array[6, 7, 8, 9, 10],
    'Avoid clipping in wet weather and clear leaf litter from inside plants.',
    'Remove affected growth carefully and disinfect tools between cuts.',
    'Use chemical controls only with up-to-date professional guidance.',
    'high',
    'If dieback spreads quickly or more than one box plant is affected.'
  ),
  (
    '00000000-0000-4000-8000-000000000903',
    'Box tree moth/caterpillar',
    'pest',
    'A key recurring check for Ann''s driveway box.',
    'Webbing, chewed leaves, frass and green caterpillars hidden inside the plant.',
    'Box in the driveway borders.',
    array[4, 5, 6, 7, 8, 9, 10],
    'Check inside the plant regularly from spring and record first signs.',
    'Hand-pick where practical and remove webbing before damage spreads.',
    'Only use treatments that are suitable for box tree caterpillar and safe for the setting.',
    'high',
    'If caterpillars are numerous or stripping whole sections.'
  ),
  (
    '00000000-0000-4000-8000-000000000904',
    'Aphids',
    'pest',
    'Soft new growth can attract aphids in spring and early summer.',
    'Clusters of small insects, sticky honeydew and distorted shoot tips.',
    'Roses, apples, soft growth and container plants.',
    array[4, 5, 6, 7, 8],
    'Encourage predators and avoid overfeeding soft growth.',
    'Squash small clusters by hand or wash off with water where practical.',
    'Avoid broad-spectrum sprays that harm beneficial insects.',
    'low',
    'If distortion is severe or honeydew causes secondary problems.'
  ),
  (
    '00000000-0000-4000-8000-000000000905',
    'Slugs/snails',
    'pest',
    'Likely in the shady borders and around hostas after wet spells.',
    'Ragged holes in leaves, slime trails and damage to young growth.',
    'Hostas, young plants and tender growth in shady borders.',
    array[3, 4, 5, 6, 9, 10],
    'Reduce hiding places around vulnerable plants and check after rain.',
    'Hand-pick during evening checks and record hotspots before using barriers.',
    'Avoid pellets unless they are wildlife-safe and genuinely needed.',
    'medium',
    'If new plantings are being stripped before they establish.'
  ),
  (
    '00000000-0000-4000-8000-000000000906',
    'Plum moth',
    'pest',
    'Fruit pest to watch on the Victoria plum in the lower field.',
    'Damaged young fruit, gum, premature fruit drop or larvae inside fruit.',
    'Plum tree in the orchard area, lower field.',
    array[5, 6, 7],
    'Inspect fruitlets regularly and remove fallen damaged fruit.',
    'Record timing and severity so next year''s checks are better timed.',
    'Pheromone traps or treatments need correct timing and product guidance.',
    'high',
    'If a large share of fruit shows damage or drop.'
  ),
  (
    '00000000-0000-4000-8000-000000000907',
    'Powdery mildew',
    'disease',
    'Often appears when roots are dry and air is still.',
    'White powdery coating on leaves, buds or stems.',
    'Roses, ornamentals and stressed plants.',
    array[6, 7, 8, 9],
    'Reduce stress with watering where needed and improve airflow.',
    'Remove badly affected growth and note whether the plant is too dry.',
    'Avoid routine spraying without a confirmed repeated problem.',
    'medium',
    'If flowering or growth is noticeably reduced.'
  ),
  (
    '00000000-0000-4000-8000-000000000908',
    'Blight',
    'disease',
    'Useful watch item for potatoes, tomatoes and other susceptible crops if grown.',
    'Brown lesions, rapid collapse in warm humid weather and affected fruit or tubers.',
    'Vegetables in the lower field beds.',
    array[7, 8, 9],
    'Keep foliage dry where possible and remove volunteers or affected material promptly.',
    'Remove infected material and do not compost badly diseased foliage.',
    'Check current advice before any treatment, especially around edible crops.',
    'high',
    'If symptoms spread quickly through edible crops.'
  ),
  (
    '00000000-0000-4000-8000-000000000909',
    'Rust',
    'disease',
    'A leaf disease to log if it appears repeatedly.',
    'Orange, brown or black pustules on leaves and weakening growth.',
    'Roses, ornamentals and some edibles.',
    array[5, 6, 7, 8, 9],
    'Clear infected leaves and avoid overcrowding.',
    'Remove badly affected foliage and record which plants repeat the problem.',
    'Use chemical controls only after confirming the crop and disease.',
    'medium',
    'If repeated defoliation weakens the plant.'
  ),
  (
    '00000000-0000-4000-8000-000000000910',
    'Possible honey fungus',
    'disease',
    'A serious but uncertain issue that should be logged carefully rather than guessed.',
    'Plant decline, white fungal sheets under bark, bootlace-like rhizomorphs or honey-coloured fungi.',
    'Woody plants, shrubs and trees.',
    array[9, 10, 11],
    'Record affected plants and avoid moving suspect woody material around the garden.',
    'Photograph signs and isolate removed woody material if suspicion is strong.',
    'Do not treat until identification is reasonably confident.',
    'high',
    'If a tree or shrub is declining rapidly or several woody plants fail nearby.'
  ),
  (
    '00000000-0000-4000-8000-000000000911',
    'Moles',
    'animal',
    'Animal activity that can disturb lawn and beds but is not usually a plant disease.',
    'Molehills, raised tunnels and loose soil on lawn or beds.',
    'Main lawn area and lower field.',
    array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    'Record where activity is increasing and level soil where it affects paths or mowing.',
    'Use observation first; avoid harm unless there is a specific practical problem.',
    'Control choices should be considered carefully and legally.',
    'medium',
    'If tunnels make paths unsafe or damage important planting.'
  ),
  (
    '00000000-0000-4000-8000-000000000912',
    'Caterpillars',
    'pest',
    'General caterpillar watch for chewed leaves outside the specific box issue.',
    'Chewed leaves, droppings and larvae on foliage.',
    'Ornamental plants, vegetables and shrubs.',
    array[5, 6, 7, 8, 9],
    'Inspect before intervening and avoid disturbing beneficial wildlife unnecessarily.',
    'Hand-pick where practical and log the host plant.',
    'Avoid broad-spectrum controls unless damage is severe and identification is clear.',
    'medium',
    'If young plants are being stripped or the issue repeats on the same plant.'
  )
on conflict (name) do update set
  issue_type = excluded.issue_type,
  description = excluded.description,
  symptoms = excluded.symptoms,
  affected_plants = excluded.affected_plants,
  likely_months = excluded.likely_months,
  prevention_note = excluded.prevention_note,
  organic_treatment_note = excluded.organic_treatment_note,
  chemical_caution_note = excluded.chemical_caution_note,
  severity = excluded.severity,
  when_to_seek_help = excluded.when_to_seek_help,
  updated_at = now();

insert into public.pest_disease_logs (
  id,
  garden_id,
  issue_id,
  plant_id,
  area_id,
  observed_by,
  observed_at,
  severity,
  note
)
values
  (
    '00000000-0000-4000-8000-000000000921',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000903',
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000207',
    '00000000-0000-4000-8000-000000000101',
    '2026-05-08',
    'medium',
    'Light chewing seen inside one box plant. Worth checking again next week.'
  ),
  (
    '00000000-0000-4000-8000-000000000922',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000905',
    '00000000-0000-4000-8000-000000000403',
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000101',
    '2026-05-02',
    'low',
    'A few ragged hosta leaves after rain under the trees.'
  )
on conflict (id) do update set
  issue_id = excluded.issue_id,
  plant_id = excluded.plant_id,
  area_id = excluded.area_id,
  observed_by = excluded.observed_by,
  observed_at = excluded.observed_at,
  severity = excluded.severity,
  note = excluded.note;
