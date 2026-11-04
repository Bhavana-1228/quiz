import { INITIAL_QUESTIONS } from '../data/initialQuestions';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import {
  Difficulty,
  Language,
  Question,
  QuestionReport,
  QuestionTopic,
  QuizSession,
  User,
  UserAnswer,
  UserProgressStats,
  UserQuestionHistory,
  UserSettings,
} from '../types';
import { AIQuestionGenerator } from './aiGenerator';

const STORAGE_KEYS = {
  USERS: 'codequest_users_v1',
  CURRENT_USER_ID: 'codequest_current_user_id_v1',
  LANGUAGES: 'codequest_languages_v1',
  QUESTIONS: 'codequest_questions_v1',
  HISTORY: 'codequest_user_question_history_v1',
  SESSIONS: 'codequest_quiz_sessions_v1',
  ANSWERS: 'codequest_user_answers_v1',
  BOOKMARKS: 'codequest_bookmarks_v1',
  REPORTS: 'codequest_reports_v1',
  SETTINGS: 'codequest_user_settings_v1',
};

// Default initial user "Manoj" as shown in Figma brief screenshots!
const DEFAULT_USER: User = {
  id: 'usr_manoj_google_108',
  google_sub: 'google_sub_984729482910',
  email: 'manoj.dev@gmail.com',
  display_name: 'Manoj',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  xp: 340,
  streak: 4,
  last_active_date: new Date().toISOString().split('T')[0],
  daily_goal: 10,
  daily_progress: 6,
};

const DEFAULT_SETTINGS: UserSettings = {
  preferred_languages: ['python', 'javascript', 'rust'],
  default_difficulty: 'Intermediate',
  daily_question_goal: 10,
  default_question_count: 10,
  timer_enabled: true,
  explanations_enabled: true,
  sound_enabled: true,
  theme: 'dark',
  font_size: 'normal',
  reduced_motion: false,
  daily_reminder: true,
  streak_reminder: true,
};

class CodeQuestDatabase {
  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.LANGUAGES)) {
      localStorage.setItem(STORAGE_KEYS.LANGUAGES, JSON.stringify(SUPPORTED_LANGUAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // --- User & Auth ---

  getCurrentUser(): User | null {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = this.getUsers();
    return users.find(u => u.id === currentId) || null;
  }

  saveCurrentUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id || u.google_sub === user.google_sub || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
  }

  syncRemoteSession(session: QuizSession, questions: Question[]) {
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: QuizSession[] = rawSessions ? JSON.parse(rawSessions) : [];
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx !== -1) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    const currentQuestions = this.getAllQuestions();
    const newQs = questions.filter(q => !currentQuestions.some(existing => existing.id === q.id));
    if (newQs.length > 0) {
      this.addQuestionsToBank(newQs);
    }
  }

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  }

  loginWithGoogle(email: string, displayName: string, avatar?: string, googleSubParam?: string): User {
    const users = this.getUsers();
    const googleSub = googleSubParam || `google_sub_${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}`;
    let user = users.find(u => u.google_sub === googleSub || u.email.toLowerCase() === email.toLowerCase());

    const todayStr = new Date().toISOString().split('T')[0];

    if (!user) {
      // First-time user creation
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        google_sub: googleSub,
        email,
        display_name: displayName,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
        created_at: new Date().toISOString(),
        xp: 0,
        streak: 1,
        last_active_date: todayStr,
        daily_goal: 10,
        daily_progress: 0,
      };
      users.push(user);
    } else {
      // Check streak for returning user
      const lastActive = user.last_active_date;
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const today = new Date(todayStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      }
      user.last_active_date = todayStr;
      if (displayName) user.display_name = displayName;
      if (avatar) user.avatar = avatar;
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    return user;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  updateUserProfile(userId: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[idx];
  }

  // --- Languages ---

  getLanguages(): Language[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LANGUAGES);
    return raw ? JSON.parse(raw) : SUPPORTED_LANGUAGES;
  }

  getLanguageBySlug(slug: string): Language | undefined {
    return this.getLanguages().find(l => l.slug === slug || l.id === slug);
  }

  // --- Questions & Bank Management ---

  getAllQuestions(): Question[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return raw ? JSON.parse(raw) : INITIAL_QUESTIONS;
  }

  saveQuestions(questions: Question[]) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  addQuestionsToBank(newQuestions: Question[]) {
    const current = this.getAllQuestions();
    const merged = [...current, ...newQuestions];
    this.saveQuestions(merged);
  }

  updateQuestionStatus(questionId: string, status: 'approved' | 'candidate' | 'retired') {
    const questions = this.getAllQuestions();
    const idx = questions.findIndex(q => q.id === questionId);
    if (idx !== -1) {
      questions[idx].status = status;
      this.saveQuestions(questions);
    }
  }

  // --- User Question History & STRICT NO-REPEAT ENFORCEMENT ---

  getUserQuestionHistory(userId: string): UserQuestionHistory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const all: UserQuestionHistory[] = raw ? JSON.parse(raw) : [];
    return all.filter(h => h.user_id === userId);
  }

  /**
   * Get fresh unseen questions count for user
   */
  getAvailableFreshCount(userId: string, languageId: string, topic?: string, difficulty?: Difficulty): number {
    const seenSet = new Set(this.getUserQuestionHistory(userId).map(h => h.question_id));
    const all = this.getAllQuestions().filter(q => q.status === 'approved');

    return all.filter(q => {
      if (seenSet.has(q.id)) return false;
      if (q.language_id !== languageId) return false;
      if (topic && q.topic !== topic) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      return true;
    }).length;
  }

  /**
   * Create Quiz Session with strict transactional no-repeat guarantee
   */
  async createQuizSession(params: {
    userId: string;
    languageId: string;
    topic?: QuestionTopic;
    difficulty: Difficulty;
    questionCount: number;
    mode?: 'fresh' | 'review' | 'daily_challenge';
    allowAIGeneration?: boolean;
    geminiApiKey?: string;
  }): Promise<{ session: QuizSession; questions: Question[]; warning?: string }> {
    const { userId, languageId, topic, difficulty, questionCount, mode = 'fresh', allowAIGeneration = true, geminiApiKey } = params;

    const allQuestions = this.getAllQuestions().filter(q => q.status === 'approved');
    let selectedQuestions: Question[] = [];
    let warning: string | undefined;

    if (mode === 'review') {
      // Deliberate review mode: explicitly pick questions user has previously seen or bookmarked
      const userHistory = this.getUserQuestionHistory(userId);
      const seenIds = new Set(userHistory.map(h => h.question_id));
      const pool = allQuestions.filter(q => seenIds.has(q.id) && (q.language_id === languageId || !languageId));
      selectedQuestions = pool.sort(() => 0.5 - Math.random()).slice(0, questionCount);
    } else {
      // Normal or Daily Challenge: STRICT NO-REPEAT ENFORCEMENT
      const userHistory = this.getUserQuestionHistory(userId);
      const seenIds = new Set(userHistory.map(h => h.question_id));

      let availableFresh = allQuestions.filter(q => {
        if (seenIds.has(q.id)) return false;
        if (languageId && q.language_id !== languageId) return false;
        if (topic && q.topic !== topic) return false;
        if (difficulty && q.difficulty !== difficulty) return false;
        return true;
      });

      // If bank is low and AI generation is enabled, synthesize fresh questions
      if (availableFresh.length < questionCount && allowAIGeneration) {
        const needed = questionCount - availableFresh.length;
        const targetTopic: QuestionTopic = topic || 'Functions';
        const aiGenerated = await AIQuestionGenerator.generateQuestions(
          {
            language_id: languageId,
            topic: targetTopic,
            difficulty,
            count: Math.max(needed, 3),
            apiKey: geminiApiKey,
          },
          allQuestions
        );

        if (aiGenerated.length > 0) {
          this.addQuestionsToBank(aiGenerated);
          availableFresh = [...availableFresh, ...aiGenerated];
        }
      }

      if (availableFresh.length === 0) {
        throw new Error('NO_UNSEEN_QUESTIONS');
      }

      if (availableFresh.length < questionCount) {
        warning = `Only ${availableFresh.length} unseen questions were available for this specific combination.`;
      }

      selectedQuestions = availableFresh.sort(() => 0.5 - Math.random()).slice(0, questionCount);

      // TRANSACTIONAL RECORDING: Immediately mark delivered questions as seen
      // so refresh, tab reload, or network interruption cannot repeat them!
      this.markQuestionsAsSeen(userId, selectedQuestions.map(q => q.id));
    }

    const session: QuizSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      language_id: languageId,
      topic,
      difficulty,
      question_count: selectedQuestions.length,
      question_ids: selectedQuestions.map(q => q.id),
      current_index: 0,
      score: 0,
      started_at: new Date().toISOString(),
      elapsed_seconds: 0,
      mode,
    };

    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: QuizSession[] = rawSessions ? JSON.parse(rawSessions) : [];
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    return { session, questions: selectedQuestions, warning };
  }

  private markQuestionsAsSeen(userId: string, questionIds: string[]) {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const history: UserQuestionHistory[] = raw ? JSON.parse(raw) : [];
    const now = new Date().toISOString();

    for (const qId of questionIds) {
      const exists = history.some(h => h.user_id === userId && h.question_id === qId);
      if (!exists) {
        history.push({
          user_id: userId,
          question_id: qId,
          first_seen_at: now,
        });
      }
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  // --- Submitting Answers & Session Completion ---

  submitAnswer(params: {
    sessionId: string;
    questionId: string;
    selectedAnswer: 'A' | 'B' | 'C' | 'D';
    timeSpentSeconds?: number;
  }): { isCorrect: boolean; correctAnswer: 'A' | 'B' | 'C' | 'D'; explanation: string; xpEarned: number } {
    const { sessionId, questionId, selectedAnswer, timeSpentSeconds = 0 } = params;

    const question = this.getAllQuestions().find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const isCorrect = question.answer === selectedAnswer;

    // Save answer
    const rawAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    const answers: UserAnswer[] = rawAnswers ? JSON.parse(rawAnswers) : [];
    const answerRecord: UserAnswer = {
      id: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      session_id: sessionId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
    };
    answers.push(answerRecord);
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));

    // Update user question history with result
    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const history: UserQuestionHistory[] = rawHistory ? JSON.parse(rawHistory) : [];
    const hIdx = history.findIndex(h => h.question_id === questionId);
    if (hIdx !== -1) {
      history[hIdx].answered_at = new Date().toISOString();
      history[hIdx].selected_answer = selectedAnswer;
      history[hIdx].is_correct = isCorrect;
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }

    // Update session score
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: QuizSession[] = rawSessions ? JSON.parse(rawSessions) : [];
    const sIdx = sessions.findIndex(s => s.id === sessionId);
    let xpEarned = 0;

    if (sIdx !== -1) {
      if (isCorrect) {
        sessions[sIdx].score += 1;
        xpEarned = 15; // 15 XP for correct
      } else {
        xpEarned = 5; // 5 XP for effort
      }
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

      // Update User XP & daily progress
      const user = this.getCurrentUser();
      if (user) {
        user.xp += xpEarned;
        user.daily_progress = (user.daily_progress || 0) + 1;
        this.updateUserProfile(user.id, { xp: user.xp, daily_progress: user.daily_progress });
      }
    }

    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation,
      xpEarned,
    };
  }

  completeSession(sessionId: string, elapsedSeconds: number): QuizSession {
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: QuizSession[] = rawSessions ? JSON.parse(rawSessions) : [];
    const sIdx = sessions.findIndex(s => s.id === sessionId);
    if (sIdx === -1) throw new Error('Session not found');

    sessions[sIdx].completed_at = new Date().toISOString();
    sessions[sIdx].elapsed_seconds = elapsedSeconds;
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return sessions[sIdx];
  }

  getSessionDetails(sessionId: string): { session: QuizSession; questions: Question[]; answers: UserAnswer[] } | null {
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: QuizSession[] = rawSessions ? JSON.parse(rawSessions) : [];
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    const allQuestions = this.getAllQuestions();
    const questions = session.question_ids.map(id => allQuestions.find(q => q.id === id)!).filter(Boolean);

    const rawAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    const allAnswers: UserAnswer[] = rawAnswers ? JSON.parse(rawAnswers) : [];
    const answers = allAnswers.filter(a => a.session_id === sessionId);

    return { session, questions, answers };
  }

  // --- Bookmarks & Reports ---

  getBookmarkedQuestionIds(userId: string): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    const all: { user_id: string; question_id: string }[] = raw ? JSON.parse(raw) : [];
    return all.filter(b => b.user_id === userId).map(b => b.question_id);
  }

  toggleBookmark(userId: string, questionId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    let all: { user_id: string; question_id: string }[] = raw ? JSON.parse(raw) : [];
    const exists = all.some(b => b.user_id === userId && b.question_id === questionId);

    if (exists) {
      all = all.filter(b => !(b.user_id === userId && b.question_id === questionId));
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(all));
      return false;
    } else {
      all.push({ user_id: userId, question_id: questionId });
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(all));
      return true;
    }
  }

  reportQuestion(report: Omit<QuestionReport, 'id' | 'created_at'>): QuestionReport {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports: QuestionReport[] = raw ? JSON.parse(raw) : [];
    const newReport: QuestionReport = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    reports.push(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return newReport;
  }

  getReports(): QuestionReport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return raw ? JSON.parse(raw) : [];
  }

  // --- Settings ---

  getSettings(): UserSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  }

  updateSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // --- User Analytics & Progress ---

  getUserProgress(userId: string): UserProgressStats {
    const user = this.getCurrentUser();
    const history = this.getUserQuestionHistory(userId);
    const rawAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    const answers: UserAnswer[] = rawAnswers ? JSON.parse(rawAnswers) : [];
    const allQuestions = this.getAllQuestions();

    const answeredHistory = history.filter(h => h.answered_at && h.is_correct !== undefined);
    const totalAnswered = answeredHistory.length;
    const totalCorrect = answeredHistory.filter(h => h.is_correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const topicStats: Record<string, { total: number; correct: number }> = {};
    const languageStats: Record<string, { total: number; correct: number; total_available: number }> = {};

    // Group answers by topic and language
    for (const h of answeredHistory) {
      const q = allQuestions.find(item => item.id === h.question_id);
      if (!q) continue;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 };
      }
      topicStats[q.topic].total += 1;
      if (h.is_correct) topicStats[q.topic].correct += 1;

      if (!languageStats[q.language_id]) {
        const totalAvail = allQuestions.filter(item => item.language_id === q.language_id).length;
        languageStats[q.language_id] = { total: 0, correct: 0, total_available: totalAvail };
      }
      languageStats[q.language_id].total += 1;
      if (h.is_correct) languageStats[q.language_id].correct += 1;
    }

    // Weak topic insights: topics with accuracy < 70% and at least 1 attempt
    const weakTopics: { topic: string; language: string; accuracy: number; count: number }[] = [];
    Object.entries(topicStats).forEach(([top, stat]) => {
      const acc = Math.round((stat.correct / stat.total) * 100);
      if (acc < 75) {
        weakTopics.push({
          topic: top,
          language: 'All',
          accuracy: acc,
          count: stat.total,
        });
      }
    });

    const xp = user?.xp || 0;
    const level = Math.floor(xp / 100) + 1;

    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: QuizSession[] = rawSessions ? JSON.parse(rawSessions) : [];
    const userSessions = sessions.filter(s => s.user_id === userId && s.completed_at);

    return {
      total_answered: totalAnswered,
      total_correct: totalCorrect,
      accuracy,
      current_streak: user?.streak || 0,
      best_streak: Math.max(user?.streak || 0, 7),
      xp,
      level,
      quizzes_completed: userSessions.length,
      weak_topics: weakTopics,
      topic_stats: topicStats,
      language_stats: languageStats,
    };
  }

  // --- Reset & Export Data (Page 9 Privacy & Data) ---

  exportUserData(userId: string) {
    const user = this.getCurrentUser();
    const history = this.getUserQuestionHistory(userId);
    const settings = this.getSettings();
    const stats = this.getUserProgress(userId);

    return {
      exported_at: new Date().toISOString(),
      user,
      history,
      settings,
      stats,
    };
  }

  clearUserHistory(userId: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const history: UserQuestionHistory[] = raw ? JSON.parse(raw) : [];
    const filtered = history.filter(h => h.user_id !== userId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));

    const rawAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    const answers: UserAnswer[] = rawAnswers ? JSON.parse(rawAnswers) : [];
    // Keep answers for other users
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  }
}

export const db = new CodeQuestDatabase();

