import { Difficulty, Language, Question, QuestionTopic, QuizSession, UserProgressStats, UserSettings } from '../types';
import { db } from './db';

export interface CreateSessionRequest {
  language_id: string;
  topic?: QuestionTopic;
  difficulty: Difficulty;
  question_count: number;
  mode?: 'fresh' | 'review' | 'daily_challenge';
}

export interface CreateSessionResponse {
  session_id: string;
  session: QuizSession;
  questions: Question[];
  warning?: string;
}

export interface SubmitAnswerRequest {
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  time_spent_seconds?: number;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  xp_earned: number;
}

const getHeaders = () => {
  const user = db.getCurrentUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (user) {
    headers['x-user-id'] = user.id;
  }
  return headers;
};

/**
 * Service talking directly to backend API (/api) with graceful local fallback
 */
export const api = {
  // Google Auth Endpoint
  async loginWithGoogle(payload: { sub?: string; email: string; name?: string; picture?: string }) {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          db.saveCurrentUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.warn('Backend /api/auth/google call failed, syncing locally:', err);
    }
    return db.loginWithGoogle(payload.email, payload.name || payload.email.split('@')[0], payload.picture, payload.sub);
  },

  // Email & Password Sign-In
  async signInWithPassword(email: string, password: string) {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in.');
    }
    db.saveCurrentUser(data.user);
    return data.user;
  },

  // Email & Password Sign-Up
  async signUpWithPassword(userData: {
    email: string;
    password: string;
    display_name: string;
    preferred_languages?: string[];
    skill_level?: string;
    daily_goal?: number;
  }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign up.');
    }
    db.saveCurrentUser(data.user);
    return data.user;
  },

  // POST /api/quiz-sessions
  async createQuizSession(req: CreateSessionRequest): Promise<CreateSessionResponse> {
    const user = db.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    try {
      const res = await fetch('/api/quiz-sessions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
      if (res.ok) {
        const data = await res.json();
        // Sync local record for offline capabilities
        db.syncRemoteSession(data.session, data.questions);
        return data;
      }
    } catch (err) {
      console.warn('Backend /api/quiz-sessions failed, using local DB:', err);
    }

    const settings = db.getSettings();
    const result = await db.createQuizSession({
      userId: user.id,
      languageId: req.language_id,
      topic: req.topic,
      difficulty: req.difficulty,
      questionCount: req.question_count,
      mode: req.mode,
      allowAIGeneration: true,
      geminiApiKey: settings.gemini_api_key,
    });

    return {
      session_id: result.session.id,
      session: result.session,
      questions: result.questions,
      warning: result.warning,
    };
  },

  // POST /api/quiz-sessions/:id/answers
  async submitAnswer(sessionId: string, req: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const user = db.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    try {
      const res = await fetch(`/api/quiz-sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
      if (res.ok) {
        const data = await res.json();
        // update local state as well
        db.submitAnswer({
          sessionId,
          questionId: req.question_id,
          selectedAnswer: req.selected_answer,
          timeSpentSeconds: req.time_spent_seconds,
        });
        return data;
      }
    } catch (err) {
      console.warn('Backend answer submission failed, using local DB:', err);
    }

    const localRes = db.submitAnswer({
      sessionId,
      questionId: req.question_id,
      selectedAnswer: req.selected_answer,
      timeSpentSeconds: req.time_spent_seconds,
    });

    return {
      is_correct: localRes.isCorrect,
      correct_answer: localRes.correctAnswer,
      explanation: localRes.explanation,
      xp_earned: localRes.xpEarned,
    };
  },

  // POST /api/quiz-sessions/:id/complete
  async completeQuizSession(sessionId: string, elapsedSeconds: number): Promise<QuizSession> {
    try {
      const res = await fetch(`/api/quiz-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ elapsed_seconds: elapsedSeconds }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return db.completeSession(sessionId, elapsedSeconds);
  },

  // GET /api/progress
  async getProgress(): Promise<UserProgressStats> {
    const user = db.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    try {
      const res = await fetch('/api/progress', {
        headers: getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return db.getUserProgress(user.id);
  },

  // GET /api/languages
  async getLanguages(): Promise<Language[]> {
    try {
      const res = await fetch('/api/languages');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return db.getLanguages();
  },

  // GET /api/settings
  async getSettings(): Promise<UserSettings> {
    return db.getSettings();
  },

  // PATCH /api/settings
  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    return db.updateSettings(updates);
  },
};
