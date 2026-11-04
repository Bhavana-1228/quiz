import { Router } from 'express';
import { query, run } from '../db/database.js';

const router = Router();

router.get('/questions', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM questions ORDER BY rowid DESC;');
    const formatted = rows.map(r => ({
      ...r,
      options: JSON.parse(r.options),
      model_metadata: r.model_metadata ? JSON.parse(r.model_metadata) : undefined,
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/questions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await run('UPDATE questions SET status = ? WHERE id = ?;', [status, req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { language_id, topic, difficulty, count } = req.body;
    const batchCount = parseInt(count) || 2;
    const generatedList = [];

    // Synthesize schema-compliant candidate questions
    for (let i = 0; i < batchCount; i++) {
      const qId = `ai_${language_id}_${Date.now()}_${i}`;
      const uniqueSuffix = `[${language_id.toUpperCase()} • ${topic} • Candidate #${Math.floor(Math.random() * 899 + 100)}]`;
      const prompt = `Which best practice or core principle applies when working with ${topic} in ${language_id}? ${uniqueSuffix}`;
      const options = [
        { label: 'A', text: `Follow idiomatic ${language_id} design conventions`, description: 'Preferred standard pattern' },
        { label: 'B', text: 'Bypass runtime verification checks', description: 'Anti-pattern' },
        { label: 'C', text: 'Allocate unbounded global state buffers', description: 'Memory leak hazard' },
        { label: 'D', text: 'Suppress all exceptions silently', description: 'Debugging obstacle' }
      ];
      const answer = 'A';
      const explanation = `In ${language_id}, adopting official language idioms ensures predictable resource lifetimes, high maintainability, and clean type-safety.`;

      await run(
        `INSERT INTO questions (id, language_id, topic, difficulty, prompt, options, answer, explanation, status, created_by, model_metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'candidate', 'ai', ?);`,
        [
          qId,
          language_id,
          topic,
          difficulty || 'Intermediate',
          prompt,
          JSON.stringify(options),
          answer,
          explanation,
          JSON.stringify({ model: 'codequest-v2-schema-engine', generated_at: new Date().toISOString() })
        ]
      );

      generatedList.push({
        id: qId,
        language_id,
        topic,
        difficulty: difficulty || 'Intermediate',
        prompt,
        options,
        answer,
        explanation,
        status: 'candidate'
      });
    }

    return res.json({ success: true, count: generatedList.length, questions: generatedList });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/clear-history', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  await run('DELETE FROM user_question_history WHERE user_id = ?;', [userId]);
  await run('DELETE FROM user_answers WHERE session_id IN (SELECT id FROM quiz_sessions WHERE user_id = ?);', [userId]);

  return res.json({ success: true, message: 'Question history reset successfully.' });
});

export default router;

