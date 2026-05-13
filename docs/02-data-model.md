# Data Model

This is the starting data model for Ann’s Garden Planner.

The app will likely use Supabase Postgres.

## Core tables

### profiles

Represents Ann, Mark and Alicia.

Fields:

- id
- display_name
- role
- email
- avatar_url
- created_at

Roles:

- owner
- gardener
- helper

### gardens

For MVP, there is one garden.

Fields:

- id
- name
- location_label
- country
- region
- nearest_city
- notes
- created_at

Seed value:

- Ann’s Garden
- North Somerset, near Bristol, England

### garden_areas

Fields:

- id
- garden_id
- name
- description
- sunlight
- soil_type
- soil_ph
- drainage
- moisture_notes
- microclimate_notes
- display_order
- archived_at
- created_at
- updated_at

### categories

Fields:

- id
- name
- type
- icon
- colour_token
- display_order
- is_default
- archived_at

Initial categories:

- plants
- shrubs
- trees
- lawn
- vegetables
- fruit
- bulbs
- containers
- compost/soil
- wildlife
- pest/disease
- repair

### plants

Fields:

- id
- garden_id
- primary_area_id, nullable
- common_name
- latin_name
- cultivar
- plant_type
- status
- health_status
- date_planted
- expected_height
- expected_spread
- pruning_notes
- watering_notes
- feeding_notes
- soil_preference
- sun_preference
- pest_disease_risks
- flowering_period
- fruiting_period
- general_notes
- is_unknown
- archived_at
- created_at
- updated_at

Plant status values:

- active
- removed
- dead
- unknown

Health status values:

- thriving
- okay
- needs_attention
- struggling
- unknown

### tasks

Represents task templates and custom tasks.

Fields:

- id
- garden_id
- title
- description
- why_it_matters
- category_id
- plant_id, nullable
- area_id, nullable
- task_type
- priority
- recurrence_type
- month
- timing_window
- estimated_minutes
- difficulty
- tools_needed
- weather_warning
- safety_warning
- wildlife_warning
- guidance_url
- is_default
- is_hidden
- created_by
- archived_at
- created_at
- updated_at

Task type examples:

- maintenance
- planting
- pruning
- watering
- feeding
- mulching
- inspection
- pest_watch
- diary_follow_up
- repair
- custom

Timing window values:

- early_month
- mid_month
- late_month
- all_month
- specific_date

### task_instances

Represents generated task occurrences for a specific month/year.

Fields:

- id
- task_id
- garden_id
- year
- month
- due_start_date
- due_end_date
- status
- assigned_to
- postponed_until
- created_at
- updated_at

Status values:

- not_started
- done
- partial
- postponed
- skipped
- not_applicable
- overdue

### task_completions

History of task actions.

Fields:

- id
- task_instance_id
- completed_by
- status
- completed_at
- note
- time_spent_minutes
- skip_reason
- postpone_reason
- follow_up_task_id
- created_at

### diary_entries

Fields:

- id
- garden_id
- created_by
- entry_date
- title
- quick_note
- area_id
- plant_id
- task_instance_id
- what_went_well
- what_went_badly
- what_to_try_next
- follow_up_needed
- follow_up_task_id
- created_at
- updated_at

### tags

Fields:

- id
- name
- type
- created_at

Initial tags:

- watering
- pruning
- flowering
- pest
- disease
- soil
- weather
- planting
- harvest
- repair
- lesson learned

### diary_entry_tags

Fields:

- diary_entry_id
- tag_id

### photos

Fields:

- id
- garden_id
- uploaded_by
- storage_path
- thumbnail_path
- original_storage_path
- caption
- taken_at
- uploaded_at
- area_id
- plant_id
- task_instance_id
- diary_entry_id
- pest_disease_issue_id
- tags
- same_position_note
- comparison_group_id

### pest_disease_issues

Fields:

- id
- name
- issue_type
- description
- symptoms
- affected_plants
- likely_months
- prevention_note
- organic_treatment_note
- chemical_caution_note
- severity
- when_to_seek_help
- external_url
- created_at
- updated_at

Issue type values:

- pest
- disease
- animal
- unknown

### pest_disease_logs

Fields:

- id
- garden_id
- issue_id
- plant_id
- area_id
- observed_by
- observed_at
- severity
- note
- follow_up_task_id
- created_at

### seasonal_plans

Fields:

- id
- garden_id
- title
- description
- area_id
- plant_id
- target_month
- target_year
- status
- created_by
- created_at
- updated_at

Status values:

- idea
- planned
- in_progress
- done
- deferred
- archived

## Notes

- Area links should usually be optional.
- Plant links should usually be optional.
- Do not hard-delete important records by default.
- Prefer archive fields where possible.
- Completed tasks should remain in history.
