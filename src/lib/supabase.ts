import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  university?: string;
  department?: string;
  year_of_study?: number;
  gpa?: number;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  title: string;
  department: string;
  year: number;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  total_marks: number;
  time_taken_seconds: number;
  completed_at: string;
  answers: Record<string, string>;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  faculty: string;
  description: string;
  icon: string;
  exam_count: number;
  student_count: number;
  pass_rate: number;
}
