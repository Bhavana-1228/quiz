import { Router } from 'express';
import { getOne, run } from '../db/database.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  let s = await getOne('SELECT * FROM settings WHERE user_id = ?;', [userId]);
  if (!s) {
    s = {
      user_id: userId,
      timer_enabled: 1,
      explanations_enabled: 1,
      sound_enabled: 1,
      theme: 'dark',
      font_size: 'normal',
      gemini_api_key: null,
    };
    await run(
      'INSERT INTO settings (user_id, timer_enabled, explanations_enabled, sound_enabled, theme, font_size) VALUES (?, 1, 1, 1, "dark", "normal");',
      [userId]
    );
  }

  return res.json({
    timer_enabled: Boolean(s.timer_enabled),
    explanations_enabled: Boolean(s.explanations_enabled),
    sound_enabled: Boolean(s.sound_enabled),
    theme: s.theme,
    font_size: s.font_size,
    gemini_api_key: s.gemini_api_key,
  });
});

router.patch('/', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { timer_enabled, explanations_enabled, sound_enabled, theme, font_size, gemini_api_key } = req.body;

  await run(
    `INSERT INTO settings (user_id, timer_enabled, explanations_enabled, sound_enabled, theme, font_size, gemini_api_key)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       timer_enabled = COALESCE(?, timer_enabled),
       explanations_enabled = COALESCE(?, explanations_enabled),
       sound_enabled = COALESCE(?, sound_enabled),
       theme = COALESCE(?, theme),
       font_size = COALESCE(?, font_size),
       gemini_api_key = COALESCE(?, gemini_api_key);`,
    [
      userId,
      timer_enabled !== undefined ? (timer_enabled ? 1 : 0) : 1,
      explanations_enabled !== undefined ? (explanations_enabled ? 1 : 0) : 1,
      sound_enabled !== undefined ? (sound_enabled ? 1 : 0) : 1,
      theme || 'dark',
      font_size || 'normal',
      gemini_api_key,
      timer_enabled !== undefined ? (timer_enabled ? 1 : 0) : null,
      explanations_enabled !== undefined ? (explanations_enabled ? 1 : 0) : null,
      sound_enabled !== undefined ? (sound_enabled ? 1 : 0) : null,
      theme,
      font_size,
      gemini_api_key,
    ]
  );

  return res.json({ success: true });
});

export default router;

