export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          cv_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          cv_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      initialize_profile_table: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}