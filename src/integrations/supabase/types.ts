export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      donations: {
        Row: {
          co2_evitado: number
          created_at: string
          direccion: string | null
          email: string
          id: string
          metodo_entrega: string
          ninos_beneficiados: number
          nombre: string
          peso_estimado: number
          recompensa: string
          status: string
          telefono: string | null
          tracking_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          co2_evitado: number
          created_at?: string
          direccion?: string | null
          email: string
          id?: string
          metodo_entrega: string
          ninos_beneficiados: number
          nombre: string
          peso_estimado: number
          recompensa: string
          status?: string
          telefono?: string | null
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          co2_evitado?: number
          created_at?: string
          direccion?: string | null
          email?: string
          id?: string
          metodo_entrega?: string
          ninos_beneficiados?: number
          nombre?: string
          peso_estimado?: number
          recompensa?: string
          status?: string
          telefono?: string | null
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          available_stock: number
          being_completed_count: number
          being_used_count: number
          created_at: string
          id: string
          product_id: string | null
          rented_count: number
          returning_count: number
          set_id: string | null
          shipping_count: number
          total_stock: number
          updated_at: string
        }
        Insert: {
          available_stock?: number
          being_completed_count?: number
          being_used_count?: number
          created_at?: string
          id?: string
          product_id?: string | null
          rented_count?: number
          returning_count?: number
          set_id?: string | null
          shipping_count?: number
          total_stock?: number
          updated_at?: string
        }
        Update: {
          available_stock?: number
          being_completed_count?: number
          being_used_count?: number
          created_at?: string
          id?: string
          product_id?: string | null
          rented_count?: number
          returning_count?: number
          set_id?: string | null
          shipping_count?: number
          total_stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          age_range: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          piece_count: number
          skill_boost: string[] | null
          theme: string
          updated_at: string
        }
        Insert: {
          age_range: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          piece_count: number
          skill_boost?: string[] | null
          theme: string
          updated_at?: string
        }
        Update: {
          age_range?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          piece_count?: number
          skill_boost?: string[] | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ciudad: string | null
          codigo_postal: string | null
          created_at: string
          direccion: string | null
          full_name: string | null
          id: string
          impact_points: number | null
          profile_completed: boolean | null
          sub_status: string | null
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          created_at?: string
          direccion?: string | null
          full_name?: string | null
          id?: string
          impact_points?: number | null
          profile_completed?: boolean | null
          sub_status?: string | null
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          created_at?: string
          direccion?: string | null
          full_name?: string | null
          id?: string
          impact_points?: number | null
          profile_completed?: boolean | null
          sub_status?: string | null
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          age_range: string
          catalogue_visibility: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          lego_ref: string | null
          name: string
          piece_count: number
          skill_boost: string[] | null
          theme: string
          updated_at: string
          weight_set: number | null
          year_released: number | null
        }
        Insert: {
          age_range: string
          catalogue_visibility?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          lego_ref?: string | null
          name: string
          piece_count: number
          skill_boost?: string[] | null
          theme: string
          updated_at?: string
          weight_set?: number | null
          year_released?: number | null
        }
        Update: {
          age_range?: string
          catalogue_visibility?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          lego_ref?: string | null
          name?: string
          piece_count?: number
          skill_boost?: string[] | null
          theme?: string
          updated_at?: string
          weight_set?: number | null
          year_released?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          set_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          set_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          set_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "operador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "operador"],
    },
  },
} as const
