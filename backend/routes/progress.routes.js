import { Router } from 'express';
import { query, getOne } from '../db/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getOne('SELECT * FROM users WHERE id = ?;', [userId]);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const history = await query(
      `SELECT uqh.*, q.topic, q.language_id
       FROM user_question_history uqh
       INNER JOIN questions q ON uqh.question_id = q.id
       WHERE uqh.user_id = ? AND uqh.answered_at IS NOT NULL;`,
      [userId]
    );

    const totalAnswered = history.length;
    const totalCorrect = history.filter(h => h.is_correct === 1).length;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const topicStats = {};
    const languageStats = {};

    for (const h of history) {
      if (!topicStats[h.topic]) {
        topicStats[h.topic] = { total: 0, correct: 0 };
      }
      topicStats[h.topic].total += 1;
      if (h.is_correct === 1) topicStats[h.topic].correct += 1;

      if (!languageStats[h.language_id]) {
        languageStats[h.language_id] = { total: 0, correct: 0 };
      }
      languageStats[h.language_id].total += 1;
      if (h.is_correct === 1) languageStats[h.language_id].correct += 1;
    }

    const weakTopics = [];
    Object.entries(topicStats).forEach(([top, stat]) => {
      const acc = Math.round((stat.correct / stat.total) * 100);
      if (acc < 75) {
        weakTopics.push({ topic: top, accuracy: acc, count: stat.total });
      }
    });

    const sessionsRow = await getOne(
      'SELECT COUNT(*) as count FROM quiz_sessions WHERE user_id = ? AND completed_at IS NOT NULL;',
      [userId]
    );

    return res.json({
      total_answered: totalAnswered,
      total_correct: totalCorrect,
      accuracy,
      current_streak: user.streak || 1,
      best_streak: Math.max(user.streak || 1, 5),
      xp: user.xp || 0,
      level: Math.floor((user.xp || 0) / 100) + 1,
      quizzes_completed: sessionsRow ? sessionsRow.count : 0,
      weak_topics: weakTopics,
      topic_stats: topicStats,
      language_stats: languageStats,
    });
  } catch (err) {
    console.error('Progress Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;

