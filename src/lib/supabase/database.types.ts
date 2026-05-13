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
