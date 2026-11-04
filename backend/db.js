import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_LANGUAGES, SEED_QUESTIONS } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class BackendDatabase {
  constructor() {
    this.files = {
      users: path.join(DATA_DIR, 'users.json'),
      languages: path.join(DATA_DIR, 'languages.json'),
      questions: path.join(DATA_DIR, 'questions.json'),
      history: path.join(DATA_DIR, 'user_question_history.json'),
      sessions: path.join(DATA_DIR, 'quiz_sessions.json'),
      answers: path.join(DATA_DIR, 'user_answers.json'),
      bookmarks: path.join(DATA_DIR, 'bookmarks.json'),
      reports: path.join(DATA_DIR, 'reports.json'),
      settings: path.join(DATA_DIR, 'settings.json'),
    };

    this.initDatabase();
  }

  privateRead(table) {
    try {
      const filePath = this.files[table];
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Error reading ${table}:`, err);
      return [];
    }
  }

  privateWrite(table, data) {
    try {
      const filePath = this.files[table];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error writing ${table}:`, err);
    }
  }

  initDatabase() {
    // Seed languages if empty
    if (!fs.existsSync(this.files.languages) || this.privateRead('languages').length === 0) {
      this.privateWrite('languages', SEED_LANGUAGES);
    }
    // Seed questions if empty
    if (!fs.existsSync(this.files.questions) || this.privateRead('questions').length === 0) {
      this.privateWrite('questions', SEED_QUESTIONS);
    }
    // Ensure all other tables exist as empty arrays
    for (const key of ['users', 'history', 'sessions', 'answers', 'bookmarks', 'reports']) {
      if (!fs.existsSync(this.files[key])) {
        this.privateWrite(key, []);
      }
    }
    if (!fs.existsSync(this.files.settings)) {
      this.privateWrite('settings', {});
    }
  }

  // --- Real Google Authentication & User Profile Management ---
  findOrCreateGoogleUser({ sub, email, name, picture }) {
    const users = this.privateRead('users');
    let user = users.find(u => u.google_sub === sub || (email && u.email.toLowerCase() === email.toLowerCase()));

    const todayStr = new Date().toISOString().split('T')[0];

    if (!user) {
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        google_sub: sub,
        email: email || '',
        display_name: name || 'Google Developer',
        avatar: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`,
        created_at: new Date().toISOString(),
        xp: 0,
        streak: 1,
        last_active_date: todayStr,
        daily_goal: 10,
        daily_progress: 0,
      };
      users.push(user);
    } else {
      // Returning user - update profile info & streak
      if (name) user.display_name = name;
      if (picture) user.avatar = picture;
      if (sub && !user.google_sub) user.google_sub = sub;

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
    }

    this.privateWrite('users', users);
    return user;
  }

  getUserById(id) {
    const users = this.privateRead('users');
    return users.find(u => u.id === id) || null;
  }

  updateUser(id, updates) {
    const users = this.privateRead('users');
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.privateWrite('users', users);
    return users[idx];
  }

  // --- Languages ---
  getLanguages() {
    return this.privateRead('languages');
  }

  getLanguageBySlug(slug) {
    const languages = this.getLanguages();
    return languages.find(l => l.slug === slug || l.id === slug) || null;
  }

  // --- Questions ---
  getAllQuestions() {
    return this.privateRead('questions');
  }

  addQuestions(newQuestions) {
    const current = this.getAllQuestions();
    const merged = [...current, ...newQuestions];
    this.privateWrite('questions', merged);
  }

  updateQuestionStatus(id, status) {
    const questions = this.getAllQuestions();
    const idx = questions.findIndex(q => q.id === id);
    if (idx !== -1) {
      questions[idx].status = status;
      this.privateWrite('questions', questions);
    }
  }

  // --- No-Repeat Question History ---
  getUserHistory(userId) {
    const all = this.privateRead('history');
    return all.filter(h => h.user_id === userId);
  }

  getAvailableFreshCount(userId, languageId, topic, difficulty) {
    const history = this.getUserHistory(userId);
    const seenIds = new Set(history.map(h => h.question_id));
    const all = this.getAllQuestions().filter(q => q.status === 'approved');

    return all.filter(q => {
      if (seenIds.has(q.id)) return false;
      if (languageId && q.language_id !== languageId) return false;
      if (topic && topic !== 'All' && q.topic !== topic) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      return true;
    }).length;
  }

  createQuizSession({ userId, languageId, topic, difficulty, questionCount, mode }) {
    const allQuestions = this.getAllQuestions().filter(q => q.status === 'approved');
    let selectedQuestions = [];
    let warning = null;

    if (mode === 'review') {
      const history = this.getUserHistory(userId);
      const seenIds = new Set(history.map(h => h.question_id));
      const pool = allQuestions.filter(q => seenIds.has(q.id) && (!languageId || q.language_id === languageId));
      selectedQuestions = pool.sort(() => 0.5 - Math.random()).slice(0, questionCount);
    } else {
      const history = this.getUserHistory(userId);
      const seenIds = new Set(history.map(h => h.question_id));

      let availableFresh = allQuestions.filter(q => {
        if (seenIds.has(q.id)) return false;
        if (languageId && q.language_id !== languageId) return false;
        if (topic && topic !== 'All' && q.topic !== topic) return false;
        if (difficulty && q.difficulty !== difficulty) return false;
        return true;
      });

      if (availableFresh.length === 0) {
        throw new Error('NO_UNSEEN_QUESTIONS');
      }

      if (availableFresh.length < questionCount) {
        warning = `Only ${availableFresh.length} fresh unseen questions were available for this exact combination.`;
      }

      selectedQuestions = availableFresh.sort(() => 0.5 - Math.random()).slice(0, questionCount);

      // TRANSACTIONAL: Mark delivered questions as seen immediately
      this.markQuestionsAsSeen(userId, selectedQuestions.map(q => q.id));
    }

    const session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      language_id: languageId,
      topic: topic || 'All',
      difficulty: difficulty || 'Intermediate',
      question_count: selectedQuestions.length,
      question_ids: selectedQuestions.map(q => q.id),
      current_index: 0,
      score: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      elapsed_seconds: 0,
      mode: mode || 'fresh',
    };

    const sessions = this.privateRead('sessions');
    sessions.push(session);
    this.privateWrite('sessions', sessions);

    return { session, questions: selectedQuestions, warning };
  }

  markQuestionsAsSeen(userId, questionIds) {
    const history = this.privateRead('history');
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
    this.privateWrite('history', history);
  }

  submitAnswer({ userId, sessionId, questionId, selectedAnswer, timeSpentSeconds }) {
    const questions = this.getAllQuestions();
    const question = questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const isCorrect = question.answer === selectedAnswer;

    // Record answer
    const answers = this.privateRead('answers');
    answers.push({
      id: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      session_id: sessionId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds || 0,
    });
    this.privateWrite('answers', answers);

    // Update history entry
    const history = this.privateRead('history');
    const hIdx = history.findIndex(h => h.user_id === userId && h.question_id === questionId);
    if (hIdx !== -1) {
      history[hIdx].answered_at = new Date().toISOString();
      history[hIdx].selected_answer = selectedAnswer;
      history[hIdx].is_correct = isCorrect;
      this.privateWrite('history', history);
    }

    // Update session score
    const sessions = this.privateRead('sessions');
    const sIdx = sessions.findIndex(s => s.id === sessionId);
    let xpEarned = isCorrect ? 15 : 5;

    if (sIdx !== -1) {
      if (isCorrect) sessions[sIdx].score += 1;
      this.privateWrite('sessions', sessions);

      // Update user XP & daily progress
      const user = this.getUserById(userId);
      if (user) {
        user.xp = (user.xp || 0) + xpEarned;
        user.daily_progress = (user.daily_progress || 0) + 1;
        this.updateUser(userId, { xp: user.xp, daily_progress: user.daily_progress });
      }
    }

    return {
      is_correct: isCorrect,
      correct_answer: question.answer,
      explanation: question.explanation,
      xp_earned: xpEarned,
    };
  }

  completeSession(sessionId, elapsedSeconds) {
    const sessions = this.privateRead('sessions');
    const sIdx = sessions.findIndex(s => s.id === sessionId);
    if (sIdx === -1) throw new Error('Session not found');

    sessions[sIdx].completed_at = new Date().toISOString();
    sessions[sIdx].elapsed_seconds = elapsedSeconds || 0;
    this.privateWrite('sessions', sessions);
    return sessions[sIdx];
  }

  getSessionDetails(sessionId) {
    const sessions = this.privateRead('sessions');
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    const allQuestions = this.getAllQuestions();
    const questions = session.question_ids.map(id => allQuestions.find(q => q.id === id)).filter(Boolean);

    const allAnswers = this.privateRead('answers');
    const answers = allAnswers.filter(a => a.session_id === sessionId);

    return { session, questions, answers };
  }

  // --- Analytics & Progress ---
  getUserProgress(userId) {
    const user = this.getUserById(userId);
    const history = this.getUserHistory(userId);
    const allQuestions = this.getAllQuestions();

    const answered = history.filter(h => h.answered_at && h.is_correct !== undefined);
    const totalAnswered = answered.length;
    const totalCorrect = answered.filter(h => h.is_correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const topicStats = {};
    const languageStats = {};

    for (const h of answered) {
      const q = allQuestions.find(item => item.id === h.question_id);
      if (!q) continue;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 };
      }
      topicStats[q.topic].total += 1;
      if (h.is_correct) topicStats[q.topic].correct += 1;

      if (!languageStats[q.language_id]) {
        languageStats[q.language_id] = { total: 0, correct: 0 };
      }
      languageStats[q.language_id].total += 1;
      if (h.is_correct) languageStats[q.language_id].correct += 1;
    }

    const weakTopics = [];
    Object.entries(topicStats).forEach(([top, stat]) => {
      const acc = Math.round((stat.correct / stat.total) * 100);
      if (acc < 75) {
        weakTopics.push({ topic: top, accuracy: acc, count: stat.total });
      }
    });

    const sessions = this.privateRead('sessions').filter(s => s.user_id === userId && s.completed_at);

    return {
      total_answered: totalAnswered,
      total_correct: totalCorrect,
      accuracy,
      current_streak: user?.streak || 1,
      best_streak: Math.max(user?.streak || 1, 5),
      xp: user?.xp || 0,
      level: Math.floor((user?.xp || 0) / 100) + 1,
      quizzes_completed: sessions.length,
      weak_topics: weakTopics,
      topic_stats: topicStats,
      language_stats: languageStats,
    };
  }

  // --- Bookmarks ---
  getBookmarks(userId) {
    const bookmarks = this.privateRead('bookmarks');
    return bookmarks.filter(b => b.user_id === userId).map(b => b.question_id);
  }

  toggleBookmark(userId, questionId) {
    let bookmarks = this.privateRead('bookmarks');
    const exists = bookmarks.some(b => b.user_id === userId && b.question_id === questionId);

    if (exists) {
      bookmarks = bookmarks.filter(b => !(b.user_id === userId && b.question_id === questionId));
      this.privateWrite('bookmarks', bookmarks);
      return false;
    } else {
      bookmarks.push({ user_id: userId, question_id: questionId, created_at: new Date().toISOString() });
      this.privateWrite('bookmarks', bookmarks);
      return true;
    }
  }

  // --- Reports ---
  addReport({ userId, questionId, reason, details }) {
    const reports = this.privateRead('reports');
    const rep = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      question_id: questionId,
      reason,
      details,
      created_at: new Date().toISOString(),
    };
    reports.push(rep);
    this.privateWrite('reports', reports);
    return rep;
  }

  getReports() {
    return this.privateRead('reports');
  }

  // --- Clear History ---
  clearUserHistory(userId) {
    const history = this.privateRead('history');
    const filtered = history.filter(h => h.user_id !== userId);
    this.privateWrite('history', filtered);
  }
}

export const backendDb = new BackendDatabase();

