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
        }
      }
      leaderboard: {
        Row: {
          id: string
          user_id: string
          display_name: string
          puzzles_solved: number
          puzzles_attempted: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          puzzles_solved?: number
          puzzles_attempted?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          puzzles_solved?: number
          puzzles_attempted?: number
          created_at?: string
          updated_at?: string
        }
      }
      puzzle_attempts: {
        Row: {
          id: string
          user_id: string
          puzzle_id: number
          attempts: number
          solved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          puzzle_id: number
          attempts?: number
          solved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          puzzle_id?: number
          attempts?: number
          solved?: boolean
          created_at?: string
          updated_at?: string
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