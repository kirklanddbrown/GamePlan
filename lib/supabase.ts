import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the client instance
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Export the createClient function for components that need it
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Types for our database
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          team: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          team?: string | null
        }
        Update: {
          email?: string
          name?: string
          team?: string | null
          updated_at?: string
        }
      }
      situations: {
        Row: {
          id: string
          user_id: string
          name: string
          down: number
          distance: number
          field_position: string | null
          time_remaining: string | null
          score: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          down: number
          distance: number
          field_position?: string | null
          time_remaining?: string | null
          score?: string | null
          description?: string | null
        }
        Update: {
          name?: string
          down?: number
          distance?: number
          field_position?: string | null
          time_remaining?: string | null
          score?: string | null
          description?: string | null
          updated_at?: string
        }
      }
      plays: {
        Row: {
          id: string
          user_id: string
          situation_id: string
          name: string
          formation: string
          play_type: string
          description: string | null
          personnel: string | null
          tags: string[]
          notes: string | null
          success: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          situation_id: string
          name: string
          formation: string
          play_type: string
          description?: string | null
          personnel?: string | null
          tags?: string[]
          notes?: string | null
          success?: boolean | null
        }
        Update: {
          situation_id?: string
          name?: string
          formation?: string
          play_type?: string
          description?: string | null
          personnel?: string | null
          tags?: string[]
          notes?: string | null
          success?: boolean | null
          updated_at?: string
        }
      }
      weeks: {
        Row: {
          id: string
          user_id: string
          opponent: string
          game_date: string
          location: string | null
          notes: string | null
          selected_situations: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          opponent: string
          game_date: string
          location?: string | null
          notes?: string | null
          selected_situations?: string[]
        }
        Update: {
          opponent?: string
          game_date?: string
          location?: string | null
          notes?: string | null
          selected_situations?: string[]
          updated_at?: string
        }
      }
      play_scripts: {
        Row: {
          id: string
          user_id: string
          week_id: string
          name: string
          description: string | null
          situation_id: string | null
          play_ids: string[]
          situations_order: string[]
          play_orders: Record<string, string[]>
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          week_id: string
          name: string
          description?: string | null
          situation_id?: string | null
          play_ids?: string[]
          situations_order?: string[]
          play_orders?: Record<string, string[]>
        }
        Update: {
          name?: string
          description?: string | null
          situation_id?: string | null
          play_ids?: string[]
          situations_order?: string[]
          play_orders?: Record<string, string[]>
          updated_at?: string
        }
      }
      week_plays: {
        Row: {
          id: string
          user_id: string
          week_id: string
          play_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          week_id: string
          play_id: string
        }
        Update: {
          week_id?: string
          play_id?: string
        }
      }
      custom_play_types: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          user_id: string
          name: string
        }
        Update: {
          name?: string
        }
      }
    }
  }
}
