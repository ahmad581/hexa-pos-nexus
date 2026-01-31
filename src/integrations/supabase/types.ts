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
      backup_history: {
        Row: {
          backup_type: string
          branch_id: string
          created_at: string
          created_by: string | null
          file_path: string
          file_size: number | null
          id: string
          status: string
        }
        Insert: {
          backup_type?: string
          branch_id: string
          created_at?: string
          created_by?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          status?: string
        }
        Update: {
          backup_type?: string
          branch_id?: string
          created_at?: string
          created_by?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      branch_settings: {
        Row: {
          address: string | null
          analytics_tracking: boolean | null
          auto_backup: boolean | null
          branch_id: string
          business_name: string | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          language: string
          menu_design: string
          phone: string | null
          printers: Json | null
          receipt_footer: string | null
          tax_rate: number | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          analytics_tracking?: boolean | null
          auto_backup?: boolean | null
          branch_id: string
          business_name?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          language?: string
          menu_design?: string
          phone?: string | null
          printers?: Json | null
          receipt_footer?: string | null
          tax_rate?: number | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          analytics_tracking?: boolean | null
          auto_backup?: boolean | null
          branch_id?: string
          business_name?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          language?: string
          menu_design?: string
          phone?: string | null
          printers?: Json | null
          receipt_footer?: string | null
          tax_rate?: number | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
          business_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
        ]
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
      business_type_features: {
        Row: {
          business_type_id: string
          created_at: string
          feature_id: string
          id: string
          is_default: boolean
        }
        Insert: {
          business_type_id: string
          created_at?: string
          feature_id: string
          id?: string
          is_default?: boolean
        }
        Update: {
          business_type_id?: string
          created_at?: string
          feature_id?: string
          id?: string
          is_default?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "business_type_features_business_type_id_fkey"
            columns: ["business_type_id"]
            isOneToOne: false
            referencedRelation: "business_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_type_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "available_features"
            referencedColumns: ["id"]
          },
        ]
      }
      business_type_roles: {
        Row: {
          business_type_id: string
          created_at: string | null
          id: string
          is_default: boolean | null
          role_id: string
        }
        Insert: {
          business_type_id: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          role_id: string
        }
        Update: {
          business_type_id?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_type_roles_business_type_id_fkey"
            columns: ["business_type_id"]
            isOneToOne: false
            referencedRelation: "business_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_type_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_types: {
        Row: {
          category: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          terminology: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          icon: string
          id: string
          is_active?: boolean
          name: string
          terminology?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          terminology?: Json
          updated_at?: string
        }
        Relationships: []
      }
      call_center_login_sessions: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          login_time: string
          logout_time: string | null
          profile_id: string
          session_duration_seconds: number | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          profile_id: string
          session_duration_seconds?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          profile_id?: string
          session_duration_seconds?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_center_login_sessions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_center_login_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_center_numbers: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          phone_number: string
          twilio_sid: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number: string
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_center_numbers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      call_history: {
        Row: {
          business_id: string
          call_queue_id: string | null
          call_type: string
          callee_phone: string | null
          caller_name: string | null
          caller_phone: string
          created_at: string | null
          direction: string
          duration_seconds: number | null
          handled_by: string | null
          id: string
          notes: string | null
          outcome: string | null
          recording_duration_seconds: number | null
          recording_url: string | null
          status: string
        }
        Insert: {
          business_id: string
          call_queue_id?: string | null
          call_type: string
          callee_phone?: string | null
          caller_name?: string | null
          caller_phone: string
          created_at?: string | null
          direction?: string
          duration_seconds?: number | null
          handled_by?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          recording_duration_seconds?: number | null
          recording_url?: string | null
          status: string
        }
        Update: {
          business_id?: string
          call_queue_id?: string | null
          call_type?: string
          callee_phone?: string | null
          caller_name?: string | null
          caller_phone?: string
          created_at?: string | null
          direction?: string
          duration_seconds?: number | null
          handled_by?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          recording_duration_seconds?: number | null
          recording_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_history_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_history_call_queue_id_fkey"
            columns: ["call_queue_id"]
            isOneToOne: false
            referencedRelation: "call_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_history_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_queue: {
        Row: {
          answered_at: string | null
          answered_by: string | null
          business_id: string
          call_center_number_id: string | null
          call_type: string | null
          caller_address: string | null
          caller_name: string | null
          caller_phone: string
          completed_at: string | null
          created_at: string | null
          id: string
          priority: string | null
          queue_position: number | null
          status: string
          transferred_at: string | null
          transferred_to: string | null
          twilio_call_sid: string | null
          updated_at: string | null
          wait_time_seconds: number | null
        }
        Insert: {
          answered_at?: string | null
          answered_by?: string | null
          business_id: string
          call_center_number_id?: string | null
          call_type?: string | null
          caller_address?: string | null
          caller_name?: string | null
          caller_phone: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          queue_position?: number | null
          status?: string
          transferred_at?: string | null
          transferred_to?: string | null
          twilio_call_sid?: string | null
          updated_at?: string | null
          wait_time_seconds?: number | null
        }
        Update: {
          answered_at?: string | null
          answered_by?: string | null
          business_id?: string
          call_center_number_id?: string | null
          call_type?: string | null
          caller_address?: string | null
          caller_name?: string | null
          caller_phone?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          queue_position?: number | null
          status?: string
          transferred_at?: string | null
          transferred_to?: string | null
          twilio_call_sid?: string | null
          updated_at?: string | null
          wait_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_queue_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_call_center_number_id_fkey"
            columns: ["call_center_number_id"]
            isOneToOne: false
            referencedRelation: "call_center_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_transferred_to_fkey"
            columns: ["transferred_to"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      employee_extensions: {
        Row: {
          business_id: string
          created_at: string | null
          extension_number: string
          id: string
          is_available: boolean | null
          profile_id: string
          twilio_sid: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          extension_number: string
          id?: string
          is_available?: boolean | null
          profile_id: string
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          extension_number?: string
          id?: string
          is_available?: boolean | null
          profile_id?: string
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_extensions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_extensions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_loans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          interest_rate: number
          loan_amount: number
          monthly_payment: number
          next_payment_date: string | null
          paid_amount: number
          payment_period_months: number
          reason: string | null
          rejected_reason: string | null
          remaining_amount: number | null
          start_date: string | null
          status: string
          total_repayment: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          interest_rate?: number
          loan_amount: number
          monthly_payment: number
          next_payment_date?: string | null
          paid_amount?: number
          payment_period_months: number
          reason?: string | null
          rejected_reason?: string | null
          remaining_amount?: number | null
          start_date?: string | null
          status?: string
          total_repayment: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          interest_rate?: number
          loan_amount?: number
          monthly_payment?: number
          next_payment_date?: string | null
          paid_amount?: number
          payment_period_months?: number
          reason?: string | null
          rejected_reason?: string | null
          remaining_amount?: number | null
          start_date?: string | null
          status?: string
          total_repayment?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
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
          password: string | null
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
          password?: string | null
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
          password?: string | null
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
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
            foreignKeyName: "inventory_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
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
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
            foreignKeyName: "inventory_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
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
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
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
            foreignKeyName: "inventory_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          branch_id: string
          created_at: string
          employee_id: string
          id: string
          loan_id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          payment_method: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          employee_id: string
          id?: string
          loan_id: string
          notes?: string | null
          payment_amount: number
          payment_date: string
          payment_method?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          loan_id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "employee_loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_settings: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          interest_rate_percentage: number
          is_active: boolean
          max_active_loans: number
          max_loan_amount: number
          max_monthly_payment_percentage: number
          max_payment_period_months: number
          min_employment_months: number
          min_loan_amount: number
          min_payment_period_months: number
          notes: string | null
          require_approval: boolean
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          interest_rate_percentage?: number
          is_active?: boolean
          max_active_loans?: number
          max_loan_amount?: number
          max_monthly_payment_percentage?: number
          max_payment_period_months?: number
          min_employment_months?: number
          min_loan_amount?: number
          min_payment_period_months?: number
          notes?: string | null
          require_approval?: boolean
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          interest_rate_percentage?: number
          is_active?: boolean
          max_active_loans?: number
          max_loan_amount?: number
          max_monthly_payment_percentage?: number
          max_payment_period_months?: number
          min_employment_months?: number
          min_loan_amount?: number
          min_payment_period_months?: number
          notes?: string | null
          require_approval?: boolean
          updated_at?: string
        }
        Relationships: []
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
          printer_ids: string[] | null
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
          printer_ids?: string[] | null
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
          printer_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_recipients: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipients_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          branch_id: string | null
          business_id: string
          created_at: string
          created_by: string | null
          id: string
          message: string
          metadata: Json | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          branch_id?: string | null
          business_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
          title: string
          type: string
        }
        Update: {
          branch_id?: string | null
          business_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_audit_log: {
        Row: {
          action_type: string
          branch_id: string
          business_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          order_id: string
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          action_type: string
          branch_id: string
          business_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          order_id: string
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          branch_id?: string
          business_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          order_id?: string
          performed_at?: string
          performed_by?: string | null
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
          branch_id: string | null
          business_id: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          is_super_admin: boolean | null
          last_name: string | null
          primary_role: Database["public"]["Enums"]["app_role"] | null
          role: string | null
          role_updated_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          business_id?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          last_name?: string | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          role?: string | null
          role_updated_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          business_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          last_name?: string | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          role?: string | null
          role_updated_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_granted: boolean | null
          permission_key: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_granted?: boolean | null
          permission_key: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_granted?: boolean | null
          permission_key?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color_class: string | null
          created_at: string | null
          description: string | null
          display_name: string
          hierarchy_level: number
          icon: string | null
          id: string
          is_active: boolean | null
          is_system_role: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color_class?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          hierarchy_level?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color_class?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          hierarchy_level?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name?: string
          updated_at?: string | null
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
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          branch_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string
          business_id: string | null
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
          business_id?: string | null
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
          business_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "custom_businesses"
            referencedColumns: ["id"]
          },
        ]
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
      create_notification: {
        Args: {
          _branch_id: string
          _business_id: string
          _created_by?: string
          _message: string
          _metadata?: Json
          _severity?: string
          _title: string
          _type: string
        }
        Returns: string
      }
      current_user_has_primary_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      get_business_managers: {
        Args: { _business_id: string }
        Returns: string[]
      }
      get_role_by_name: {
        Args: { _role_name: string }
        Returns: {
          color_class: string
          description: string
          display_name: string
          hierarchy_level: number
          icon: string
          id: string
          is_system_role: boolean
          name: string
        }[]
      }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_in_branch: {
        Args: {
          _branch_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager_for_business: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
      user_has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "SuperManager"
        | "Manager"
        | "Cashier"
        | "HallManager"
        | "HrManager"
        | "CallCenterEmp"
        | "Employee"
        | "SystemMaster"
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
      app_role: [
        "SuperManager",
        "Manager",
        "Cashier",
        "HallManager",
        "HrManager",
        "CallCenterEmp",
        "Employee",
        "SystemMaster",
      ],
    },
  },
} as const
