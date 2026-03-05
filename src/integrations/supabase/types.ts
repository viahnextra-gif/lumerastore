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
      api_credentials: {
        Row: {
          created_at: string
          credential_name: string
          credential_type: string
          credential_value: string
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_name: string
          credential_type: string
          credential_value: string
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_name?: string
          credential_type?: string
          credential_value?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget: number | null
          budget_type: string | null
          campaign_type: string | null
          created_at: string
          created_by: string | null
          creatives: Json | null
          end_date: string | null
          external_campaign_id: string | null
          id: string
          metrics: Json | null
          name: string
          notes: string | null
          platform: string
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          budget_type?: string | null
          campaign_type?: string | null
          created_at?: string
          created_by?: string | null
          creatives?: Json | null
          end_date?: string | null
          external_campaign_id?: string | null
          id?: string
          metrics?: Json | null
          name: string
          notes?: string | null
          platform: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          budget_type?: string | null
          campaign_type?: string | null
          created_at?: string
          created_by?: string | null
          creatives?: Json | null
          end_date?: string | null
          external_campaign_id?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          notes?: string | null
          platform?: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string | null
          notes: string | null
          phone: string | null
          score: number | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_connections: {
        Row: {
          created_at: string
          credentials: Json | null
          id: string
          marketplace: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials?: Json | null
          id?: string
          marketplace: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials?: Json | null
          id?: string
          marketplace?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          created_at: string
          customer_name: string | null
          external_order_id: string | null
          id: string
          marketplace: string
          raw_payload: Json | null
          status: string
          tenant_id: string
          total: number | null
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          external_order_id?: string | null
          id?: string
          marketplace: string
          raw_payload?: Json | null
          status?: string
          tenant_id: string
          total?: number | null
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          external_order_id?: string | null
          id?: string
          marketplace?: string
          raw_payload?: Json | null
          status?: string
          tenant_id?: string
          total?: number | null
        }
        Relationships: []
      }
      marketplace_product_map: {
        Row: {
          created_at: string
          external_product_id: string | null
          external_sku: string | null
          id: string
          last_sync_at: string | null
          marketplace: string
          product_id: string | null
          sync_status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          external_product_id?: string | null
          external_sku?: string | null
          id?: string
          last_sync_at?: string | null
          marketplace: string
          product_id?: string | null
          sync_status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          external_product_id?: string | null
          external_sku?: string | null
          id?: string
          last_sync_at?: string | null
          marketplace?: string
          product_id?: string | null
          sync_status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_product_map_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_sync_logs: {
        Row: {
          created_at: string
          error_details: string | null
          id: string
          marketplace: string
          operation_type: string
          payload_snapshot: Json | null
          retried_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          error_details?: string | null
          id?: string
          marketplace: string
          operation_type: string
          payload_snapshot?: Json | null
          retried_at?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          error_details?: string | null
          id?: string
          marketplace?: string
          operation_type?: string
          payload_snapshot?: Json | null
          retried_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          size?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: string
          shipping_city: string
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          min_wholesale_qty: number | null
          name: string
          price: number
          sizes: string[] | null
          slug: string
          stock: number | null
          updated_at: string
          video_url: string | null
          wholesale_price: number | null
        }
        Insert: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_wholesale_qty?: number | null
          name: string
          price: number
          sizes?: string[] | null
          slug: string
          stock?: number | null
          updated_at?: string
          video_url?: string | null
          wholesale_price?: number | null
        }
        Update: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          min_wholesale_qty?: number | null
          name?: string
          price?: number
          sizes?: string[] | null
          slug?: string
          stock?: number | null
          updated_at?: string
          video_url?: string | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          created_at: string
          customer_type: Database["public"]["Enums"]["customer_type"] | null
          full_name: string | null
          id: string
          phone: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          full_name?: string | null
          id?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          full_name?: string | null
          id?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          campaign_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          external_post_id: string | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          platform: string
          published_at: string | null
          scheduled_at: string
          social_account_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_post_id?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform: string
          published_at?: string | null
          scheduled_at: string
          social_account_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          external_post_id?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          published_at?: string | null
          scheduled_at?: string
          social_account_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_secret: boolean | null
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string
          created_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_moderator: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      customer_type: "retail" | "wholesale"
      lead_status: "cold" | "warm" | "hot" | "converted"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "moderator", "user"],
      customer_type: ["retail", "wholesale"],
      lead_status: ["cold", "warm", "hot", "converted"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
