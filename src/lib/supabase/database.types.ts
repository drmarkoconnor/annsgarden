export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          archived_at: string | null;
          colour_token: string | null;
          display_order: number;
          icon: string | null;
          id: string;
          is_default: boolean;
          name: string;
          type: "plant" | "task" | "diary" | "photo";
        };
        Insert: {
          archived_at?: string | null;
          colour_token?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_default?: boolean;
          name: string;
          type: "plant" | "task" | "diary" | "photo";
        };
        Update: {
          archived_at?: string | null;
          colour_token?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_default?: boolean;
          name?: string;
          type?: "plant" | "task" | "diary" | "photo";
        };
        Relationships: [];
      };
      diary_entries: {
        Row: {
          area_id: string | null;
          created_at: string;
          created_by: string | null;
          entry_date: string;
          follow_up_needed: boolean;
          follow_up_task_id: string | null;
          garden_id: string;
          id: string;
          plant_id: string | null;
          quick_note: string;
          task_instance_id: string | null;
          title: string | null;
          updated_at: string;
          what_to_try_next: string | null;
          what_went_badly: string | null;
          what_went_well: string | null;
        };
        Insert: {
          area_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          entry_date?: string;
          follow_up_needed?: boolean;
          follow_up_task_id?: string | null;
          garden_id: string;
          id?: string;
          plant_id?: string | null;
          quick_note: string;
          task_instance_id?: string | null;
          title?: string | null;
          updated_at?: string;
          what_to_try_next?: string | null;
          what_went_badly?: string | null;
          what_went_well?: string | null;
        };
        Update: {
          area_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          entry_date?: string;
          follow_up_needed?: boolean;
          follow_up_task_id?: string | null;
          garden_id?: string;
          id?: string;
          plant_id?: string | null;
          quick_note?: string;
          task_instance_id?: string | null;
          title?: string | null;
          updated_at?: string;
          what_to_try_next?: string | null;
          what_went_badly?: string | null;
          what_went_well?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "diary_entries_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "garden_areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_follow_up_task_id_fkey";
            columns: ["follow_up_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_garden_id_fkey";
            columns: ["garden_id"];
            isOneToOne: false;
            referencedRelation: "gardens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_task_instance_id_fkey";
            columns: ["task_instance_id"];
            isOneToOne: false;
            referencedRelation: "task_instances";
            referencedColumns: ["id"];
          },
        ];
      };
      diary_entry_tags: {
        Row: {
          diary_entry_id: string;
          tag_id: string;
        };
        Insert: {
          diary_entry_id: string;
          tag_id: string;
        };
        Update: {
          diary_entry_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diary_entry_tags_diary_entry_id_fkey";
            columns: ["diary_entry_id"];
            isOneToOne: false;
            referencedRelation: "diary_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entry_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      garden_areas: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string | null;
          display_order: number;
          drainage: string | null;
          garden_id: string;
          id: string;
          microclimate_notes: string | null;
          moisture_notes: string | null;
          name: string;
          soil_ph: string | null;
          soil_type: string | null;
          sunlight: string | null;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          drainage?: string | null;
          garden_id: string;
          id?: string;
          microclimate_notes?: string | null;
          moisture_notes?: string | null;
          name: string;
          soil_ph?: string | null;
          soil_type?: string | null;
          sunlight?: string | null;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          drainage?: string | null;
          garden_id?: string;
          id?: string;
          microclimate_notes?: string | null;
          moisture_notes?: string | null;
          name?: string;
          soil_ph?: string | null;
          soil_type?: string | null;
          sunlight?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "garden_areas_garden_id_fkey";
            columns: ["garden_id"];
            isOneToOne: false;
            referencedRelation: "gardens";
            referencedColumns: ["id"];
          },
        ];
      };
      gardens: {
        Row: {
          country: string;
          created_at: string;
          id: string;
          location_label: string;
          name: string;
          nearest_city: string | null;
          notes: string | null;
          region: string | null;
        };
        Insert: {
          country?: string;
          created_at?: string;
          id?: string;
          location_label: string;
          name: string;
          nearest_city?: string | null;
          notes?: string | null;
          region?: string | null;
        };
        Update: {
          country?: string;
          created_at?: string;
          id?: string;
          location_label?: string;
          name?: string;
          nearest_city?: string | null;
          notes?: string | null;
          region?: string | null;
        };
        Relationships: [];
      };
      plants: {
        Row: {
          archived_at: string | null;
          common_name: string;
          created_at: string;
          cultivar: string | null;
          date_planted: string | null;
          expected_height: string | null;
          expected_spread: string | null;
          feeding_notes: string | null;
          flowering_period: string | null;
          fruiting_period: string | null;
          garden_id: string;
          general_notes: string | null;
          health_status: "thriving" | "okay" | "needs_attention" | "struggling" | "unknown";
          id: string;
          is_unknown: boolean;
          latin_name: string | null;
          pest_disease_risks: string | null;
          plant_type: string | null;
          primary_area_id: string | null;
          pruning_notes: string | null;
          soil_preference: string | null;
          status: "active" | "removed" | "dead" | "unknown";
          sun_preference: string | null;
          updated_at: string;
          watering_notes: string | null;
        };
        Insert: {
          archived_at?: string | null;
          common_name: string;
          created_at?: string;
          cultivar?: string | null;
          date_planted?: string | null;
          expected_height?: string | null;
          expected_spread?: string | null;
          feeding_notes?: string | null;
          flowering_period?: string | null;
          fruiting_period?: string | null;
          garden_id: string;
          general_notes?: string | null;
          health_status?: "thriving" | "okay" | "needs_attention" | "struggling" | "unknown";
          id?: string;
          is_unknown?: boolean;
          latin_name?: string | null;
          pest_disease_risks?: string | null;
          plant_type?: string | null;
          primary_area_id?: string | null;
          pruning_notes?: string | null;
          soil_preference?: string | null;
          status?: "active" | "removed" | "dead" | "unknown";
          sun_preference?: string | null;
          updated_at?: string;
          watering_notes?: string | null;
        };
        Update: {
          archived_at?: string | null;
          common_name?: string;
          created_at?: string;
          cultivar?: string | null;
          date_planted?: string | null;
          expected_height?: string | null;
          expected_spread?: string | null;
          feeding_notes?: string | null;
          flowering_period?: string | null;
          fruiting_period?: string | null;
          garden_id?: string;
          general_notes?: string | null;
          health_status?: "thriving" | "okay" | "needs_attention" | "struggling" | "unknown";
          id?: string;
          is_unknown?: boolean;
          latin_name?: string | null;
          pest_disease_risks?: string | null;
          plant_type?: string | null;
          primary_area_id?: string | null;
          pruning_notes?: string | null;
          soil_preference?: string | null;
          status?: "active" | "removed" | "dead" | "unknown";
          sun_preference?: string | null;
          updated_at?: string;
          watering_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "plants_garden_id_fkey";
            columns: ["garden_id"];
            isOneToOne: false;
            referencedRelation: "gardens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plants_primary_area_id_fkey";
            columns: ["primary_area_id"];
            isOneToOne: false;
            referencedRelation: "garden_areas";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: {
          area_id: string | null;
          caption: string | null;
          comparison_group_id: string | null;
          created_at: string;
          diary_entry_id: string | null;
          garden_id: string;
          id: string;
          original_storage_path: string | null;
          pest_disease_issue_id: string | null;
          plant_id: string | null;
          same_position_note: string | null;
          storage_path: string | null;
          tags: string[];
          taken_at: string;
          task_instance_id: string | null;
          thumbnail_path: string | null;
          updated_at: string;
          uploaded_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          area_id?: string | null;
          caption?: string | null;
          comparison_group_id?: string | null;
          created_at?: string;
          diary_entry_id?: string | null;
          garden_id: string;
          id?: string;
          original_storage_path?: string | null;
          pest_disease_issue_id?: string | null;
          plant_id?: string | null;
          same_position_note?: string | null;
          storage_path?: string | null;
          tags?: string[];
          taken_at?: string;
          task_instance_id?: string | null;
          thumbnail_path?: string | null;
          updated_at?: string;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          area_id?: string | null;
          caption?: string | null;
          comparison_group_id?: string | null;
          created_at?: string;
          diary_entry_id?: string | null;
          garden_id?: string;
          id?: string;
          original_storage_path?: string | null;
          pest_disease_issue_id?: string | null;
          plant_id?: string | null;
          same_position_note?: string | null;
          storage_path?: string | null;
          tags?: string[];
          taken_at?: string;
          task_instance_id?: string | null;
          thumbnail_path?: string | null;
          updated_at?: string;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "photos_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "garden_areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_diary_entry_id_fkey";
            columns: ["diary_entry_id"];
            isOneToOne: false;
            referencedRelation: "diary_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_garden_id_fkey";
            columns: ["garden_id"];
            isOneToOne: false;
            referencedRelation: "gardens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_pest_disease_issue_id_fkey";
            columns: ["pest_disease_issue_id"];
            isOneToOne: false;
            referencedRelation: "pest_disease_issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_task_instance_id_fkey";
            columns: ["task_instance_id"];
            isOneToOne: false;
            referencedRelation: "task_instances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pest_disease_issues: {
        Row: {
          affected_plants: string | null;
          chemical_caution_note: string | null;
          created_at: string;
          description: string | null;
          external_url: string | null;
          id: string;
          issue_type: "pest" | "disease" | "animal" | "unknown";
          likely_months: number[];
          name: string;
          organic_treatment_note: string | null;
          prevention_note: string | null;
          severity: "low" | "medium" | "high" | "unknown";
          symptoms: string | null;
          updated_at: string;
          when_to_seek_help: string | null;
        };
        Insert: {
          affected_plants?: string | null;
          chemical_caution_note?: string | null;
          created_at?: string;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          issue_type?: "pest" | "disease" | "animal" | "unknown";
          likely_months?: number[];
          name: string;
          organic_treatment_note?: string | null;
          prevention_note?: string | null;
          severity?: "low" | "medium" | "high" | "unknown";
          symptoms?: string | null;
          updated_at?: string;
          when_to_seek_help?: string | null;
        };
        Update: {
          affected_plants?: string | null;
          chemical_caution_note?: string | null;
          created_at?: string;
          description?: string | null;
          external_url?: string | null;
          id?: string;
          issue_type?: "pest" | "disease" | "animal" | "unknown";
          likely_months?: number[];
          name?: string;
          organic_treatment_note?: string | null;
          prevention_note?: string | null;
          severity?: "low" | "medium" | "high" | "unknown";
          symptoms?: string | null;
          updated_at?: string;
          when_to_seek_help?: string | null;
        };
        Relationships: [];
      };
      pest_disease_logs: {
        Row: {
          area_id: string | null;
          created_at: string;
          follow_up_task_id: string | null;
          garden_id: string;
          id: string;
          issue_id: string;
          note: string | null;
          observed_at: string;
          observed_by: string | null;
          plant_id: string | null;
          severity: "low" | "medium" | "high" | "unknown";
        };
        Insert: {
          area_id?: string | null;
          created_at?: string;
          follow_up_task_id?: string | null;
          garden_id: string;
          id?: string;
          issue_id: string;
          note?: string | null;
          observed_at?: string;
          observed_by?: string | null;
          plant_id?: string | null;
          severity?: "low" | "medium" | "high" | "unknown";
        };
        Update: {
          area_id?: string | null;
          created_at?: string;
          follow_up_task_id?: string | null;
          garden_id?: string;
          id?: string;
          issue_id?: string;
          note?: string | null;
          observed_at?: string;
          observed_by?: string | null;
          plant_id?: string | null;
          severity?: "low" | "medium" | "high" | "unknown";
        };
        Relationships: [
          {
            foreignKeyName: "pest_disease_logs_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "garden_areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pest_disease_logs_follow_up_task_id_fkey";
            columns: ["follow_up_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pest_disease_logs_garden_id_fkey";
            columns: ["garden_id"];
            isOneToOne: false;
            referencedRelation: "gardens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pest_disease_logs_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "pest_disease_issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pest_disease_logs_observed_by_fkey";
            columns: ["observed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pest_disease_logs_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      task_completions: {
        Row: {
          completed_at: string;
          completed_by: string | null;
          created_at: string;
          follow_up_task_id: string | null;
          id: string;
          note: string | null;
          postpone_reason: string | null;
          skip_reason: string | null;
          status: "not_started" | "done" | "partial" | "postponed" | "skipped" | "not_applicable" | "overdue";
          task_instance_id: string;
          time_spent_minutes: number | null;
        };
        Insert: {
          completed_at?: string;
          completed_by?: string | null;
          created_at?: string;
          follow_up_task_id?: string | null;
          id?: string;
          note?: string | null;
          postpone_reason?: string | null;
          skip_reason?: string | null;
          status: "not_started" | "done" | "partial" | "postponed" | "skipped" | "not_applicable" | "overdue";
          task_instance_id: string;
          time_spent_minutes?: number | null;
        };
        Update: {
          completed_at?: string;
          completed_by?: string | null;
          created_at?: string;
          follow_up_task_id?: string | null;
          id?: string;
          note?: string | null;
          postpone_reason?: string | null;
          skip_reason?: string | null;
          status?: "not_started" | "done" | "partial" | "postponed" | "skipped" | "not_applicable" | "overdue";
          task_instance_id?: string;
          time_spent_minutes?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "task_completions_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_completions_follow_up_task_id_fkey";
            columns: ["follow_up_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_completions_task_instance_id_fkey";
            columns: ["task_instance_id"];
            isOneToOne: false;
            referencedRelation: "task_instances";
            referencedColumns: ["id"];
          },
        ];
      };
      task_instances: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          due_end_date: string | null;
          due_start_date: string | null;
          garden_id: string;
          id: string;
          month: number;
          postponed_until: string | null;
          status: "not_started" | "done" | "partial" | "postponed" | "skipped" | "not_applicable" | "overdue";
          task_id: string;
          updated_at: string;
          year: number;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          due_end_date?: string | null;
          due_start_date?: string | null;
          garden_id: string;
          id?: string;
          month: number;
          postponed_until?: string | null;
          status?: "not_started" | "done" | "partial" | "postponed" | "skipped" | "not_applicable" | "overdue";
          task_id: string;
          updated_at?: string;
          year: number;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          due_end_date?: string | null;
          due_start_date?: string | null;
          garden_id?: string;
          id?: string;
          month?: number;
          postponed_until?: string | null;
          status?: "not_started" | "done" | "partial" | "postponed" | "skipped" | "not_applicable" | "overdue";
          task_id?: string;
          updated_at?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "task_instances_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_instances_garden_id_fkey";
            columns: ["garden_id"];
            isOneToOne: false;
            referencedRelation: "gardens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_instances_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          archived_at: string | null;
          area_id: string | null;
          category_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          difficulty: string | null;
          estimated_minutes: number | null;
          garden_id: string;
          guidance_url: string | null;
          id: string;
          is_default: boolean;
          is_hidden: boolean;
          month: number | null;
          plant_id: string | null;
          priority: "low" | "medium" | "high";
          recurrence_type: "one_off" | "annual" | "monthly" | "custom";
          safety_warning: string | null;
          task_type: "maintenance" | "planting" | "pruning" | "watering" | "feeding" | "mulching" | "inspection" | "pest_watch" | "diary_follow_up" | "repair" | "custom";
          timing_window: "early_month" | "mid_month" | "late_month" | "all_month" | "specific_date";
          title: string;
          tools_needed: string[] | null;
          updated_at: string;
          weather_warning: string | null;
          why_it_matters: string | null;
          wildlife_warning: string | null;
        };
        Insert: {
          archived_at?: string | null;
          area_id?: string | null;
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          difficulty?: string | null;
          estimated_minutes?: number | null;
          garden_id: string;
          guidance_url?: string | null;
          id?: string;
          is_default?: boolean;
          is_hidden?: boolean;
          month?: number | null;
          plant_id?: string | null;
          priority?: "low" | "medium" | "high";
          recurrence_type?: "one_off" | "annual" | "monthly" | "custom";
          safety_warning?: string | null;
          task_type?: "maintenance" | "planting" | "pruning" | "watering" | "feeding" | "mulching" | "inspection" | "pest_watch" | "diary_follow_up" | "repair" | "custom";
          timing_window?: "early_month" | "mid_month" | "late_month" | "all_month" | "specific_date";
          title: string;
          tools_needed?: string[] | null;
          updated_at?: string;
          weather_warning?: string | null;
          why_it_matters?: string | null;
          wildlife_warning?: string | null;
        };
        Update: {
          archived_at?: string | null;
          area_id?: string | null;
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          difficulty?: string | null;
          estimated_minutes?: number | null;
          garden_id?: string;
          guidance_url?: string | null;
          id?: string;
          is_default?: boolean;
          is_hidden?: boolean;
          month?: number | null;
          plant_id?: string | null;
          priority?: "low" | "medium" | "high";
          recurrence_type?: "one_off" | "annual" | "monthly" | "custom";
          safety_warning?: string | null;
          task_type?: "maintenance" | "planting" | "pruning" | "watering" | "feeding" | "mulching" | "inspection" | "pest_watch" | "diary_follow_up" | "repair" | "custom";
          timing_window?: "early_month" | "mid_month" | "late_month" | "all_month" | "specific_date";
          title?: string;
          tools_needed?: string[] | null;
          updated_at?: string;
          weather_warning?: string | null;
          why_it_matters?: string | null;
          wildlife_warning?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "garden_areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_garden_id_fkey";
            columns: ["garden_id"];
            isOneToOne: false;
            referencedRelation: "gardens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          type: "diary" | "photo" | "plant" | "task";
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          type?: "diary" | "photo" | "plant" | "task";
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          type?: "diary" | "photo" | "plant" | "task";
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          email: string | null;
          id: string;
          role: "owner" | "gardener" | "helper";
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          email?: string | null;
          id?: string;
          role: "owner" | "gardener" | "helper";
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          email?: string | null;
          id?: string;
          role?: "owner" | "gardener" | "helper";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
