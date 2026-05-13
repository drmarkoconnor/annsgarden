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
