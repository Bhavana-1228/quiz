import { Router } from 'express';
import { run, query } from '../db/database.js';

const router = Router();

router.post('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { question_id, reason, details } = req.body;
  const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  await run(
    'INSERT INTO reports (id, user_id, question_id, reason, details, created_at) VALUES (?, ?, ?, ?, ?, ?);',
    [id, userId, question_id, reason, details, now]
  );

  return res.json({ id, user_id: userId, question_id, reason, details, created_at: now });
});

router.get('/', async (req, res) => {
  const reports = await query('SELECT * FROM reports ORDER BY created_at DESC;');
  return res.json(reports);
});

export default router;

