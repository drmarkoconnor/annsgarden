insert into public.gardens (
  id,
  name,
  location_label,
  country,
  region,
  nearest_city,
  notes
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Ann''s Garden',
  'North Somerset, near Bristol, England',
  'England',
  'North Somerset',
  'Bristol',
  'One-acre rural garden for Ann''s Garden Planner.'
)
on conflict (name) do update set
  location_label = excluded.location_label,
  country = excluded.country,
  region = excluded.region,
  nearest_city = excluded.nearest_city,
  notes = excluded.notes;
