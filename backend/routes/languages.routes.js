import { Router } from 'express';
import { query, getOne } from '../db/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM languages WHERE active = 1;');
    const formatted = rows.map(r => ({
      ...r,
      active: Boolean(r.active),
      topics: JSON.parse(r.topics),
    }));
    return res.json(formatted);
  } catch (err) {
    console.error('Languages Error:', err);
    return res.status(500).json({ error: 'Failed to fetch languages.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const lang = await getOne('SELECT * FROM languages WHERE slug = ? OR id = ?;', [slug, slug]);
    if (!lang) {
      return res.status(404).json({ error: 'Language not found.' });
    }
    return res.json({
      ...lang,
      active: Boolean(lang.active),
      topics: JSON.parse(lang.topics),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

