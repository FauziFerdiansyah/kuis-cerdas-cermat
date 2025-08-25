import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipe data untuk database
export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sulit' | 'Test'
export type SubjectCategory = 'Sejarah' | 'Matematika' | 'Fisika' | 'Kimia' | 'Biologi'
export type CorrectOption = 'A' | 'B' | 'C' | 'D'

export interface Question {
  id: number
  question_text: string
  level: DifficultyLevel
  subject: SubjectCategory
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: CorrectOption
  created_at: string
}

export interface LeaderboardEntry {
  id: number
  player_name: string
  level: DifficultyLevel
  score: number
  time_taken_seconds: number
  submitted_at: string
  answers_detail?: DetailedPlayerAnswer[]
}

export interface PlayerAnswer {
  questionId: number
  selectedAnswer: CorrectOption
  isCorrect: boolean
  timeSpent: number
  questionText?: string
  correctAnswer?: CorrectOption
}

export interface DetailedPlayerAnswer {
  questionId: number
  selectedAnswer: CorrectOption
  selectedAnswerText: string
  isCorrect: boolean
  timeSpent: number
  questionText: string
  correctAnswer: CorrectOption
  correctAnswerText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}