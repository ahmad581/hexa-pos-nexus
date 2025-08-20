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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          branch_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          duration: number
          id: string
          notes: string | null
          price: number | null
          service_type: string
          status: string
          stylist_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          branch_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          duration?: number
          id?: string
          notes?: string | null
          price?: number | null
          service_type: string
          status?: string
          stylist_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          branch_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration?: number
          id?: string
          notes?: string | null
          price?: number | null
          service_type?: string
          status?: string
          stylist_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      available_features: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string
          business_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_name: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          business_type: string
          created_at?: string | null
          id: string
          is_active?: boolean | null
          manager_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          business_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      business_features: {
        Row: {
          business_id: string | null
          created_at: string | null
          feature_id: string | null
          id: string
          is_enabled: boolean | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          feature_id?: string | null
          id?: string
          is_enabled?: boolean | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          feature_id?: string | null
          id?: string
          is_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "business_features_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "available_features"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_businesses: {
        Row: {
          business_type: string
          category: string
          created_at: string | null
          icon: string | null
          id: string
          name: string
          terminology: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_type: string
          category: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          terminology?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_type?: string
          category?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          terminology?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      employee_daily_summaries: {
        Row: {
          branch_id: string
          break_hours: number | null
          created_at: string
          employee_id: string
          first_check_in: string | null
          id: string
          last_check_out: string | null
          overtime_hours: number | null
          regular_hours: number | null
          session_count: number | null
          total_earnings: number | null
          total_hours: number | null
          updated_at: string
          work_date: string
        }
        Insert: {
          branch_id: string
          break_hours?: number | null
          created_at?: string
          employee_id: string
          first_check_in?: string | null
          id?: string
          last_check_out?: string | null
          overtime_hours?: number | null
          regular_hours?: number | null
          session_count?: number | null
          total_earnings?: number | null
          total_hours?: number | null
          updated_at?: string
          work_date: string
        }
        Update: {
          branch_id?: string
          break_hours?: number | null
          created_at?: string
          employee_id?: string
          first_check_in?: string | null
          id?: string
          last_check_out?: string | null
          overtime_hours?: number | null
          regular_hours?: number | null
          session_count?: number | null
          total_earnings?: number | null
          total_hours?: number | null
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_daily_summaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          branch_id: string
          created_at: string
          description: string | null
          document_name: string
          document_type: string
          employee_id: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          description?: string | null
          document_name: string
          document_type: string
          employee_id: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          description?: string | null
          document_name?: string
          document_type?: string
          employee_id?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_work_sessions: {
        Row: {
          branch_id: string
          break_duration: number | null
          check_in_time: string
          check_out_time: string | null
          created_at: string
          employee_id: string
          id: string
          location: string | null
          notes: string | null
          session_type: string | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          break_duration?: number | null
          check_in_time: string
          check_out_time?: string | null
          created_at?: string
          employee_id: string
          id?: string
          location?: string | null
          notes?: string | null
          session_type?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          break_duration?: number | null
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          session_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_work_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          branch_id: string
          created_at: string
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string
          first_name: string
          hire_date: string
          hourly_rate: number | null
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          position: string
          salary: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number: string
          first_name: string
          hire_date: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          position: string
          salary?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string
          first_name?: string
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          position?: string
          salary?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          branch_id: string | null
          category: string
          created_at: string
          current_stock: number
          description: string | null
          expiry_date: string | null
          id: string
          last_restocked: string | null
          max_stock: number
          min_stock: number
          name: string
          sku: string
          status: string
          supplier: string | null
          unit_price: number | null
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          branch_id?: string | null
          category: string
          created_at?: string
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          last_restocked?: string | null
          max_stock?: number
          min_stock?: number
          name: string
          sku: string
          status?: string
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          branch_id?: string | null
          category?: string
          created_at?: string
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          last_restocked?: string | null
          max_stock?: number
          min_stock?: number
          name?: string
          sku?: string
          status?: string
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_quantity: number | null
          branch_id: string
          fulfilled_at: string | null
          id: string
          inventory_item_id: string
          request_notes: string | null
          requested_at: string
          requested_quantity: number
          requesting_branch_id: string | null
          status: string
          warehouse_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_quantity?: number | null
          branch_id: string
          fulfilled_at?: string | null
          id?: string
          inventory_item_id: string
          request_notes?: string | null
          requested_at?: string
          requested_quantity: number
          requesting_branch_id?: string | null
          status?: string
          warehouse_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_quantity?: number | null
          branch_id?: string
          fulfilled_at?: string | null
          id?: string
          inventory_item_id?: string
          request_notes?: string | null
          requested_at?: string
          requested_quantity?: number
          requesting_branch_id?: string | null
          status?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_requests_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_requests_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          id: string
          inventory_item_id: string
          performed_by: string | null
          quantity: number
          reason: string | null
          reference_id: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          id?: string
          inventory_item_id: string
          performed_by?: string | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          id?: string
          inventory_item_id?: string
          performed_by?: string | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          branch_id: string
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          end_date: string | null
          first_name: string
          id: string
          last_name: string
          member_number: string
          membership_type: string
          phone: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          end_date?: string | null
          first_name: string
          id?: string
          last_name: string
          member_number: string
          membership_type: string
          phone?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          end_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          member_number?: string
          membership_type?: string
          phone?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          branch_id: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean
          name: string
          preparation_time: number | null
          price: number
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          branch_id: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          name: string
          preparation_time?: number | null
          price: number
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          branch_id?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          name?: string
          preparation_time?: number | null
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          order_id: string
          product_name: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          order_id: string
          product_name: string
          quantity?: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          order_id?: string
          product_name?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: string
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          status: string
          table_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string
          status?: string
          table_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          status?: string
          table_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          branch_id: string
          created_at: string
          doctor_name: string
          dosage: string
          filled_date: string | null
          id: string
          instructions: string | null
          medication_name: string
          patient_name: string
          patient_phone: string | null
          prescription_number: string
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          doctor_name: string
          dosage: string
          filled_date?: string | null
          id?: string
          instructions?: string | null
          medication_name: string
          patient_name: string
          patient_phone?: string | null
          prescription_number: string
          quantity: number
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          doctor_name?: string
          dosage?: string
          filled_date?: string | null
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_name?: string
          patient_phone?: string | null
          prescription_number?: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          branch_id: string
          brand: string | null
          category: string
          cost: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          min_stock_level: number
          name: string
          price: number
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          brand?: string | null
          category: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock_level?: number
          name: string
          price: number
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          brand?: string | null
          category?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock_level?: number
          name?: string
          price?: number
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch_id: string
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[] | null
          branch_id: string
          capacity: number
          created_at: string
          description: string | null
          floor_number: number | null
          id: string
          price_per_night: number
          room_number: string
          room_type: string
          status: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          branch_id: string
          capacity?: number
          created_at?: string
          description?: string | null
          floor_number?: number | null
          id?: string
          price_per_night: number
          room_number: string
          room_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          branch_id?: string
          capacity?: number
          created_at?: string
          description?: string | null
          floor_number?: number | null
          id?: string
          price_per_night?: number
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          branch_id: string
          category: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_active: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          category: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          category?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      stylists: {
        Row: {
          branch_id: string
          created_at: string
          email: string | null
          hire_date: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      tables: {
        Row: {
          branch_id: string
          capacity: number
          created_at: string
          id: string
          location: string | null
          qr_code: string | null
          status: string
          table_number: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          capacity?: number
          created_at?: string
          id?: string
          location?: string | null
          qr_code?: string | null
          status?: string
          table_number: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          capacity?: number
          created_at?: string
          id?: string
          location?: string | null
          qr_code?: string | null
          status?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string
          created_at: string
          id: string
          is_active: boolean
          manager_name: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_session_hours: {
        Args: { break_minutes?: number; check_in: string; check_out: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
