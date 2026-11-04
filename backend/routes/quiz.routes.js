import { Router } from 'express';
import { query, getOne, run } from '../db/database.js';

const router = Router();

// Middleware to ensure user is logged in
const requireAuth = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }
  const user = await getOne('SELECT id FROM users WHERE id = ?;', [userId]);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }
  req.user = user;
  next();
};

/**
 * POST /api/quiz-sessions
 * Create a new quiz session with STRICT SQL-enforced no-repeat filtering
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { language_id, topic, difficulty, question_count, mode } = req.body;
    const userId = req.user.id;
    const requestedCount = parseInt(question_count) || 10;
    const diff = difficulty || 'Intermediate';

    let selectedQuestions = [];
    let warning = null;

    if (mode === 'review') {
      // Review mode: fetch questions user has previously seen or bookmarked
      const sql = `
        SELECT q.* FROM questions q
        INNER JOIN user_question_history uqh ON q.id = uqh.question_id
        WHERE uqh.user_id = ?
        ${language_id ? 'AND q.language_id = ?' : ''}
        ORDER BY RANDOM()
        LIMIT ?;
      `;
      const params = language_id ? [userId, language_id, requestedCount] : [userId, requestedCount];
      const rows = await query(sql, params);
      selectedQuestions = rows;
    } else {
      // Normal / Fresh mode: STRICT NO-REPEAT
      let sql = `
        SELECT * FROM questions
        WHERE status = 'approved'
        AND id NOT IN (SELECT question_id FROM user_question_history WHERE user_id = ?)
      `;
      const params = [userId];

      if (language_id) {
        sql += ' AND language_id = ?';
        params.push(language_id);
      }
      if (topic && topic !== 'All') {
        sql += ' AND topic = ?';
        params.push(topic);
      }
      if (diff) {
        sql += ' AND difficulty = ?';
        params.push(diff);
      }

      sql += ' ORDER BY RANDOM() LIMIT ?;';
      params.push(requestedCount);

      const rows = await query(sql, params);

      if (rows.length === 0) {
        return res.status(400).json({
          error: 'NO_UNSEEN_QUESTIONS',
          message: 'No unseen fresh questions remain for this combination. Please switch topics or practice in Review Mode!',
        });
      }

      if (rows.length < requestedCount) {
        warning = `Only ${rows.length} fresh unseen questions were available for this specific combination.`;
      }

      selectedQuestions = rows;

      // TRANSACTIONAL RECORDING: Immediately mark delivered questions as seen
      const now = new Date().toISOString();
      for (const q of selectedQuestions) {
        const histId = `uqh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await run(
          `INSERT OR IGNORE INTO user_question_history (id, user_id, question_id, first_seen_at)
           VALUES (?, ?, ?, ?);`,
          [histId, userId, q.id, now]
        );
      }
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const questionIds = selectedQuestions.map(q => q.id);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO quiz_sessions (id, user_id, language_id, topic, difficulty, question_count, question_ids, current_index, score, started_at, mode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userId,
        language_id,
        topic || 'All',
        diff,
        selectedQuestions.length,
        JSON.stringify(questionIds),
        0,
        0,
        now,
        mode || 'fresh'
      ]
    );

    const formattedQuestions = selectedQuestions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
      model_metadata: q.model_metadata ? JSON.parse(q.model_metadata) : undefined,
    }));

    const session = await getOne('SELECT * FROM quiz_sessions WHERE id = ?;', [sessionId]);
    session.question_ids = JSON.parse(session.question_ids);

    return res.status(201).json({
      session_id: sessionId,
      session,
      questions: formattedQuestions,
      warning,
    });
  } catch (err) {
    console.error('Quiz Session Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create quiz session.' });
  }
});

/**
 * GET /api/quiz-sessions/:id
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const session = await getOne('SELECT * FROM quiz_sessions WHERE id = ?;', [req.params.id]);
    if (!session) {
      return res.status(404).json({ error: 'Quiz session not found.' });
    }
    session.question_ids = JSON.parse(session.question_ids);

    const placeholders = session.question_ids.map(() => '?').join(',');
    const qRows = await query(`SELECT * FROM questions WHERE id IN (${placeholders});`, session.question_ids);

    const questions = session.question_ids.map(id => {
      const q = qRows.find(item => item.id === id);
      return q ? { ...q, options: JSON.parse(q.options) } : null;
    }).filter(Boolean);

    const answers = await query('SELECT * FROM user_answers WHERE session_id = ?;', [session.id]);

    return res.json({ session, questions, answers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/quiz-sessions/:id/answers
 */
router.post('/:id/answers', requireAuth, async (req, res) => {
  try {
    const { question_id, selected_answer, time_spent_seconds } = req.body;
    const userId = req.user.id;
    const sessionId = req.params.id;

    const question = await getOne('SELECT * FROM questions WHERE id = ?;', [question_id]);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const isCorrect = question.answer === selected_answer;
    const answerId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Record answer
    await run(
      `INSERT INTO user_answers (id, session_id, question_id, selected_answer, is_correct, answered_at, time_spent_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [answerId, sessionId, question_id, selected_answer, isCorrect ? 1 : 0, now, time_spent_seconds || 0]
    );

    // Update user_question_history
    await run(
      `UPDATE user_question_history
       SET answered_at = ?, selected_answer = ?, is_correct = ?
       WHERE user_id = ? AND question_id = ?;`,
      [now, selected_answer, isCorrect ? 1 : 0, userId, question_id]
    );

    // Update session score and user XP
    const xpEarned = isCorrect ? 15 : 5;
    if (isCorrect) {
      await run('UPDATE quiz_sessions SET score = score + 1 WHERE id = ?;', [sessionId]);
    }

    await run('UPDATE users SET xp = xp + ?, daily_progress = daily_progress + 1 WHERE id = ?;', [xpEarned, userId]);

    return res.json({
      is_correct: isCorrect,
      correct_answer: question.answer,
      explanation: question.explanation,
      xp_earned: xpEarned,
    });
  } catch (err) {
    console.error('Submit Answer Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/quiz-sessions/:id/complete
 */
router.post('/:id/complete', requireAuth, async (req, res) => {
  try {
    const { elapsed_seconds } = req.body;
    const now = new Date().toISOString();

    await run(
      'UPDATE quiz_sessions SET completed_at = ?, elapsed_seconds = ? WHERE id = ?;',
      [now, elapsed_seconds || 0, req.params.id]
    );

    const session = await getOne('SELECT * FROM quiz_sessions WHERE id = ?;', [req.params.id]);
    session.question_ids = JSON.parse(session.question_ids);

    return res.json(session);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

