import { Router } from 'express';
import { query, getOne, run } from '../db/database.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const rows = await query('SELECT question_id FROM bookmarks WHERE user_id = ?;', [userId]);
  return res.json(rows.map(r => r.question_id));
});

router.post('/toggle', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { question_id } = req.body;
  const existing = await getOne('SELECT id FROM bookmarks WHERE user_id = ? AND question_id = ?;', [userId, question_id]);

  if (existing) {
    await run('DELETE FROM bookmarks WHERE user_id = ? AND question_id = ?;', [userId, question_id]);
    return res.json({ bookmarked: false });
  } else {
    const id = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await run(
      'INSERT INTO bookmarks (id, user_id, question_id, created_at) VALUES (?, ?, ?, ?);',
      [id, userId, question_id, new Date().toISOString()]
    );
    return res.json({ bookmarked: true });
  }
});

export default router;

