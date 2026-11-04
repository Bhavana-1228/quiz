export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuestionTopic =
  | 'Basics'
  | 'Variables'
  | 'Data Types'
  | 'Operators'
  | 'Conditions'
  | 'Loops'
  | 'Functions'
  | 'OOP'
  | 'Data Structures'
  | 'Algorithms'
  | 'APIs'
  | 'Databases'
  | 'Frameworks'
  | 'Debugging';

export interface User {
  id: string;
  google_sub: string;
  email: string;
  display_name: string;
  avatar: string;
  created_at: string;
  xp: number;
  streak: number;
  last_active_date?: string;
  daily_goal: number; // e.g. 10 questions
  daily_progress: number;
}

export interface Language {
  id: string;
  name: string;
  slug: string;
  category: 'Web' | 'Backend' | 'Systems' | 'Mobile' | 'Data/AI' | 'Scripting';
  icon: string;
  color: string;
  description: string;
  active: boolean;
  topics: QuestionTopic[];
}

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  description?: string;
}

export interface Question {
  id: string;
  language_id: string; // e.g. 'python', 'javascript'
  topic: QuestionTopic;
  difficulty: Difficulty;
  prompt: string;
  code?: string;
  options: QuestionOption[];
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  status: 'approved' | 'candidate' | 'retired';
  created_by?: 'system' | 'ai';
  model_metadata?: {
    model: string;
    generated_at: string;
  };
}

export interface UserQuestionHistory {
  user_id: string;
  question_id: string;
  first_seen_at: string;
  answered_at?: string;
  selected_answer?: 'A' | 'B' | 'C' | 'D';
  is_correct?: boolean;
}

export interface QuizSession {
  id: string;
  user_id: string;
  language_id: string;
  topic?: string;
  difficulty: Difficulty;
  question_count: number;
  question_ids: string[];
  current_index: number;
  score: number;
  started_at: string;
  completed_at?: string;
  elapsed_seconds: number;
  mode: 'fresh' | 'review' | 'daily_challenge';
}

export interface UserAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  answered_at: string;
  time_spent_seconds?: number;
}

export interface UserSettings {
  preferred_languages: string[];
  default_difficulty: Difficulty;
  daily_question_goal: number;
  default_question_count: number;
  timer_enabled: boolean;
  explanations_enabled: boolean;
  sound_enabled: boolean;
  theme: 'light' | 'dark' | 'system';
  font_size: 'normal' | 'large';
  reduced_motion: boolean;
  daily_reminder: boolean;
  streak_reminder: boolean;
  gemini_api_key?: string;
}

export interface UserProgressStats {
  total_answered: number;
  total_correct: number;
  accuracy: number;
  current_streak: number;
  best_streak: number;
  xp: number;
  level: number;
  quizzes_completed: number;
  weak_topics: { topic: string; language: string; accuracy: number; count: number }[];
  topic_stats: Record<string, { total: number; correct: number }>;
  language_stats: Record<string, { total: number; correct: number; total_available: number }>;
}

export interface QuestionReport {
  id: string;
  user_id: string;
  question_id: string;
  reason: 'wrong_answer' | 'typo' | 'bad_code' | 'duplicate' | 'other';
  details: string;
  created_at: string;
}

