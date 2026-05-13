# MVP Specification

## MVP principle

Build a useful, simple, expandable app.

The first version does not need to be highly polished, but it must avoid
architectural choices that block later development.

The app should prioritise:

1. Tasks
2. Plants
3. Garden areas
4. Notes
5. Photos
6. History

## MVP features

### 1. Mobile-first app shell

The app should work well on an iPhone browser.

Navigation should be simple and use a bottom nav:

- Tasks
- Garden
- Diary
- Photos
- More

The first screen should be the Tasks screen.

### 2. User profiles

Initial profiles:

- Ann
- Mark
- Alicia

Actions should record who performed them.

### 3. Garden areas

Users should be able to create, edit, view and archive garden areas.

Each area may have:

- name
- description
- sunlight notes
- soil notes
- drainage notes
- microclimate notes
- photos
- linked plants
- linked tasks
- linked diary entries

### 4. Plant records

The app should support records for all plants, including unknown plants.

Plant fields should include:

- common name
- Latin name
- cultivar/variety
- plant type/category
- optional area
- date planted
- photo
- expected height
- expected spread
- pruning notes
- watering notes
- feeding notes
- soil preference
- sun/shade preference
- pest/disease risks
- flowering period
- fruiting period
- health status
- general notes
- archived/removed status

Health statuses:

- thriving
- okay
- needs attention
- struggling
- removed/dead
- unknown

### 5. Monthly task checklist

This is the core feature.

Tasks should be grouped by:

- month
- early/mid/late/all-month timing
- category
- urgency
- area
- plant, where relevant

Task statuses:

- not started
- done
- partially done
- postponed
- skipped
- not applicable

Each task should support:

- title
- short description
- why it matters, briefly
- timing window
- category
- urgency
- related area
- related plant
- tools needed
- weather warning
- safety/wildlife warning
- notes
- photos
- completed by
- completed date
- optional time spent

Completed tasks should disappear from the active task list but remain in
history.

### 6. In-app reminders only

For MVP, do not build push notifications, emails or calendar sync.

The app should show reminder-style cards inside the app for:

- due now
- overdue
- upcoming
- postponed
- high-priority pruning tasks

### 7. Diary and notes

The diary should be quick.

Default fields:

- quick note
- optional area
- optional plant
- optional task
- optional photo
- tags
- created by
- date

Optional expanded fields:

- what went well
- what went badly
- what to try next
- follow-up task
- reminder month/date

The app should not force long diary entries.

### 8. Photos

Photos should be attachable to:

- areas
- plants
- tasks
- diary entries

Photos should store:

- image
- date
- caption
- tags
- linked area/plant/task/diary entry
- uploaded by

MVP comparison:

- side-by-side comparison
- area timeline
- same month across years, if data exists

Photos should be stored online but protected behind app login.

### 9. Simple pest/disease watch

In MVP, pest/disease should be simple seasonal inspection tasks.

Do not build a full treatment encyclopedia in version 1.

Initial issues to support:

- black spot
- box blight
- box tree moth/caterpillar
- aphids
- slugs/snails
- plum moth
- powdery mildew
- blight
- rust
- possible honey fungus
- moles
- caterpillars

### 10. Planning future jobs

The app should support planned tasks such as:

- planting bulbs
- sowing seeds
- dividing perennials
- taking cuttings
- moving shrubs
- planting bare-root trees
- ordering compost
- mulching beds
- renovating lawn

Purchase needs should be recorded as notes inside planned tasks, not as a
separate shopping-list feature in MVP.

## Out of scope for MVP

Do not build these yet:

- native iPhone app
- App Store release
- push notifications
- email notifications
- Apple Calendar integration
- live weather API
- RHS integration
- full gardening encyclopedia
- AI plant identification
- AI photo comparison
- visual garden map
- full offline-first sync
- furniture module
- hard landscaping maintenance module
- public product version
