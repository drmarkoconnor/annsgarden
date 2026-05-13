# Build Plan

## Build principle

Build the app in small working pieces.

Do not ask the AI agent to build the whole app at once.

Each stage should leave the app usable and deployable.

## Phase 0 — Project setup

Status: complete or in progress.

Tasks:

- Create Next.js app
- Add TypeScript
- Add Tailwind
- Add ESLint
- Create GitHub repo
- Deploy to Netlify
- Create /docs files

## Phase 1 — Mobile app shell

Build:

- app layout
- bottom navigation
- Tasks, Garden, Diary, Photos, More pages
- simple placeholder content
- mobile-first styling
- dashboard cards

Do not add database yet.

## Phase 2 — Static prototype screens

Build static/mock screens for:

- task list
- task detail
- garden areas
- plant list
- diary
- photo page

Purpose:

- confirm navigation
- confirm mobile layout
- avoid database complexity too early

## Phase 3 — Supabase setup

Add:

- Supabase project
- environment variables
- Supabase client
- initial schema
- seed data
- Netlify environment variables

Tables to create first:

- profiles
- gardens
- garden_areas
- categories
- plants

## Phase 4 — Garden areas and plants

Build real CRUD for:

- garden areas
- plants
- plant health status
- optional area link
- archive support

## Phase 5 — Tasks

Build:

- tasks table
- task instances
- task list
- task detail
- task status changes
- completion history
- completed by
- overdue logic
- month/timing window logic

## Phase 6 — Diary

Build:

- quick diary notes
- optional expanded fields
- tags
- links to area/plant/task
- follow-up task creation

## Phase 7 — Photos

Build:

- Supabase Storage upload
- photo records
- link photos to areas/plants/tasks/diary
- photo timeline
- side-by-side comparison

## Phase 8 — Search, filters and admin

Build:

- search
- filters
- saved filters if needed
- hidden tasks
- category management
- profile management
- exports

## Phase 9 — Pest/disease watch

Build lightweight pest/disease support:

- seasonal inspection tasks
- issue list
- outbreak logs
- short organic-first notes
- external link placeholders

## Phase 10 — Refinement

Improve:

- mobile usability
- form length
- speed
- empty states
- error states
- loading states
- accessibility
- Netlify deployment reliability

## Development rules

- Commit after each working phase.
- Keep the app deployable.
- Do not introduce several major systems at once.
- Do not add future features early.
- Keep MVP focused on tasks, plants, areas, notes and photos.
