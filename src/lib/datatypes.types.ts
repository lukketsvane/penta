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
      crosswords: {
        Row: {
          id: number
          date: string
          title: string
          theme: string
          grid: Json
          solution: Json
          across_clues: Json
          down_clues: Json
          song: Json | null
          theme_image_url: string | null
        }
        Insert: {
          id?: number
          date: string
          title: string
          theme: string
          grid: Json
          solution: Json
          across_clues: Json
          down_clues: Json
          song?: Json | null
          theme_image_url?: string | null
        }
        Update: {
          id?: number
          date?: string
          title?: string
          theme?: string
          grid?: Json
          solution?: Json
          across_clues?: Json
          down_clues?: Json
          song?: Json | null
          theme_image_url?: string | null
        }
      }
      leaderboard: {
        Row: {
          id: number
          user_id: string
          username: string
          puzzles_solved: number
        }
        Insert: {
          id?: number
          user_id: string
          username: string
          puzzles_solved: number
        }
        Update: {
          id?: number
          user_id?: string
          username?: string
          puzzles_solved?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}