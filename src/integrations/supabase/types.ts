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
      backoffice_operations: {
        Row: {
          event_id: string
          metadata: Json | null
          operation_time: string
          operation_type: Database["public"]["Enums"]["operation_type"]
          user_id: string | null
        }
        Insert: {
          event_id?: string
          metadata?: Json | null
          operation_time?: string
          operation_type: Database["public"]["Enums"]["operation_type"]
          user_id?: string | null
        }
        Update: {
          event_id?: string
          metadata?: Json | null
          operation_time?: string
          operation_type?: Database["public"]["Enums"]["operation_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      envios: {
        Row: {
          ciudad_envio: string
          codigo_postal_envio: string
          costo_envio: number | null
          created_at: string
          direccion_envio: string
          direccion_proveedor_recogida: string | null
          estado_envio: string
          fecha_asignada: string | null
          fecha_entrega_usuario: string | null
          fecha_lista_almacen: string | null
          fecha_recepcion_almacen: string | null
          fecha_recogida_almacen: string | null
          fecha_solicitud_devolucion: string | null
          id: string
          notas_adicionales: string | null
          numero_seguimiento: string | null
          order_id: string
          pais_envio: string
          proveedor_envio: string | null
          proveedor_recogida: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ciudad_envio: string
          codigo_postal_envio: string
          costo_envio?: number | null
          created_at?: string
          direccion_envio: string
          direccion_proveedor_recogida?: string | null
          estado_envio?: string
          fecha_asignada?: string | null
          fecha_entrega_usuario?: string | null
          fecha_lista_almacen?: string | null
          fecha_recepcion_almacen?: string | null
          fecha_recogida_almacen?: string | null
          fecha_solicitud_devolucion?: string | null
          id?: string
          notas_adicionales?: string | null
          numero_seguimiento?: string | null
          order_id: string
          pais_envio?: string
          proveedor_envio?: string | null
          proveedor_recogida?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ciudad_envio?: string
          codigo_postal_envio?: string
          costo_envio?: number | null
          created_at?: string
          direccion_envio?: string
          direccion_proveedor_recogida?: string | null
          estado_envio?: string
          fecha_asignada?: string | null
          fecha_entrega_usuario?: string | null
          fecha_lista_almacen?: string | null
          fecha_recepcion_almacen?: string | null
          fecha_recogida_almacen?: string | null
          fecha_solicitud_devolucion?: string | null
          id?: string
          notas_adicionales?: string | null
          numero_seguimiento?: string | null
          order_id?: string
          pais_envio?: string
          proveedor_envio?: string | null
          proveedor_recogida?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "envios_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_sets: {
        Row: {
          cantidad_total: number
          created_at: string
          en_devolucion: number
          en_envio: number
          en_reparacion: number
          en_uso: number
          id: string
          set_id: string
          set_ref: string | null
          stock_central: number
          updated_at: string
        }
        Insert: {
          cantidad_total?: number
          created_at?: string
          en_devolucion?: number
          en_envio?: number
          en_reparacion?: number
          en_uso?: number
          id?: string
          set_id: string
          set_ref?: string | null
          stock_central?: number
          updated_at?: string
        }
        Update: {
          cantidad_total?: number
          created_at?: string
          en_devolucion?: number
          en_envio?: number
          en_reparacion?: number
          en_uso?: number
          id?: string
          set_id?: string
          set_ref?: string | null
          stock_central?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_sets_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: true
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          available_stock: number
          being_completed_count: number
          being_used_count: number
          created_at: string
          id: string
          returning_count: number
          set_id: string
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
          returning_count?: number
          set_id: string
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
          returning_count?: number
          set_id?: string
          shipping_count?: number
          total_stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: true
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      operaciones_recepcion: {
        Row: {
          created_at: string
          id: string
          missing_parts: string | null
          peso_obtenido: number | null
          set_id: string
          status_recepcion: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          missing_parts?: string | null
          peso_obtenido?: number | null
          set_id: string
          status_recepcion?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          missing_parts?: string | null
          peso_obtenido?: number | null
          set_id?: string
          status_recepcion?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operaciones_recepcion_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivered_date: string | null
          id: string
          notes: string | null
          order_date: string
          returned_date: string | null
          set_id: string | null
          shipped_date: string | null
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          returned_date?: string | null
          set_id?: string | null
          shipped_date?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          returned_date?: string | null
          set_id?: string | null
          shipped_date?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          address_extra: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          impact_points: number | null
          phone: string | null
          province: string | null
          sub_status: string | null
          subscription_id: string | null
          subscription_status: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_extra?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          impact_points?: number | null
          phone?: string | null
          province?: string | null
          sub_status?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_extra?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          impact_points?: number | null
          phone?: string | null
          province?: string | null
          sub_status?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      set_piece_list: {
        Row: {
          bricklink_color_id: string | null
          color_ref: string | null
          created_at: string
          id: string
          lego_element_id: string | null
          lego_ref: string
          piece_description: string | null
          piece_qty: number
          piece_ref: string
          piece_studdim: string | null
          piece_url: string | null
          piece_weight: number | null
          set_id: string
          updated_at: string
        }
        Insert: {
          bricklink_color_id?: string | null
          color_ref?: string | null
          created_at?: string
          id?: string
          lego_element_id?: string | null
          lego_ref: string
          piece_description?: string | null
          piece_qty?: number
          piece_ref: string
          piece_studdim?: string | null
          piece_url?: string | null
          piece_weight?: number | null
          set_id: string
          updated_at?: string
        }
        Update: {
          bricklink_color_id?: string | null
          color_ref?: string | null
          created_at?: string
          id?: string
          lego_element_id?: string | null
          lego_ref?: string
          piece_description?: string | null
          piece_qty?: number
          piece_ref?: string
          piece_studdim?: string | null
          piece_url?: string | null
          piece_weight?: number | null
          set_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "set_piece_list_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
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
          set_dim: string | null
          set_minifigs: number | null
          set_weight: number | null
          skill_boost: string[] | null
          theme: string
          updated_at: string
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
          set_dim?: string | null
          set_minifigs?: number | null
          set_weight?: number | null
          skill_boost?: string[] | null
          theme: string
          updated_at?: string
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
          set_dim?: string | null
          set_minifigs?: number | null
          set_weight?: number | null
          skill_boost?: string[] | null
          theme?: string
          updated_at?: string
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
          set_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          set_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          set_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
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
      operation_type:
        | "recepcion paquete"
        | "analisis_peso"
        | "deposito_fulfillment"
        | "higienizado"
        | "retorno_stock"
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
      operation_type: [
        "recepcion paquete",
        "analisis_peso",
        "deposito_fulfillment",
        "higienizado",
        "retorno_stock",
      ],
    },
  },
} as const
