import { Router } from 'express';
import { getOne, run, hashPassword, verifyPassword } from '../db/database.js';

const router = Router();

/**
 * Instagram-Style Sign-Up
 * Takes: email, full_name (display_name), username, password
 * Creates account and prompts user to sign in!
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, display_name, full_name, username } = req.body;

    const targetEmail = (email || '').trim().toLowerCase();
    const targetFullName = (full_name || display_name || '').trim();
    const targetUsername = (username || targetEmail.split('@')[0] || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, '');

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!targetFullName) {
      return res.status(400).json({ error: 'Please enter your Full Name.' });
    }
    if (!targetUsername || targetUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if email already registered
    const existingEmail = await getOne('SELECT id FROM users WHERE LOWER(email) = ?;', [targetEmail]);
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Check if username already taken
    const existingUsername = await getOne('SELECT id FROM users WHERE LOWER(username) = ?;', [targetUsername]);
    if (existingUsername) {
      return res.status(409).json({ error: 'This username is already taken. Please choose another.' });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = hashPassword(password);
    const todayStr = new Date().toISOString().split('T')[0];
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(targetUsername)}`;

    await run(
      `INSERT INTO users (id, username, email, password_hash, display_name, avatar, created_at, xp, streak, last_active_date, daily_goal, daily_progress, preferred_languages, skill_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        targetUsername,
        targetEmail,
        passwordHash,
        targetFullName,
        avatar,
        new Date().toISOString(),
        50, // Welcome XP bonus
        1,
        todayStr,
        10,
        0,
        JSON.stringify(['python', 'javascript']),
        'Intermediate'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please sign in with your credentials.',
      registered_identifier: targetEmail,
      username: targetUsername,
    });
  } catch (err) {
    console.error('Sign Up Error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

/**
 * Instagram-Style Sign-In
 * Takes identifier (either username OR email) + password
 */
router.post('/signin', async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Please enter your username/email and password.' });
    }

    // Lookup by either email OR username
    const user = await getOne(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?;',
      [loginId, loginId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Sorry, your password or username was incorrect. Please check your credentials.' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account was registered with Google. Please use Google Sign-In.' });
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Sorry, your password was incorrect. Please double-check your password.' });
    }

    // Update streak for daily activity
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = user.streak || 1;
    if (user.last_active_date) {
      const lastDate = new Date(user.last_active_date);
      const today = new Date(todayStr);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    await run('UPDATE users SET streak = ?, last_active_date = ? WHERE id = ?;', [newStreak, todayStr, user.id]);

    delete user.password_hash;
    user.streak = newStreak;
    user.last_active_date = todayStr;

    return res.json({
      success: true,
      user,
      message: 'Signed in successfully!',
    });
  } catch (err) {
    console.error('Sign In Error:', err);
    return res.status(500).json({ error: 'Failed to sign in.' });
  }
});

/**
 * Authentic Google Sign-In / Sign-Up
 */
router.post('/google', async (req, res) => {
  try {
    const { sub, email, name, picture } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google email is required.' });
    }

    const googleEmail = email.trim().toLowerCase();
    const googleSub = sub || `google_sub_${btoa(googleEmail).replace(/[^a-zA-Z0-9]/g, '')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const generatedUsername = googleEmail.split('@')[0].replace(/[^a-z0-9_.]/g, '');

    let user = await getOne('SELECT * FROM users WHERE google_sub = ? OR LOWER(email) = ?;', [googleSub, googleEmail]);

    if (!user) {
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const avatar = picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || googleEmail)}`;
      const displayName = name || googleEmail.split('@')[0];

      await run(
        `INSERT INTO users (id, google_sub, username, email, display_name, avatar, created_at, xp, streak, last_active_date, daily_goal, daily_progress)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, googleSub, generatedUsername, googleEmail, displayName, avatar, new Date().toISOString(), 50, 1, todayStr, 10, 0]
      );

      user = await getOne('SELECT id, google_sub, username, email, display_name, avatar, xp, streak, daily_goal, daily_progress, created_at FROM users WHERE id = ?;', [userId]);
    } else {
      let newStreak = user.streak || 1;
      if (user.last_active_date) {
        const lastDate = new Date(user.last_active_date);
        const today = new Date(todayStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
      }

      await run(
        `UPDATE users SET streak = ?, last_active_date = ?, avatar = COALESCE(?, avatar), google_sub = COALESCE(?, google_sub) WHERE id = ?;`,
        [newStreak, todayStr, picture, googleSub, user.id]
      );

      delete user.password_hash;
      user.streak = newStreak;
      user.last_active_date = todayStr;
      if (picture) user.avatar = picture;
    }

    return res.json({
      success: true,
      user,
      message: 'Authenticated with Google.',
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
});

router.get('/me', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.json({ user: null });
  }
  const user = await getOne(
    'SELECT id, google_sub, username, email, display_name, avatar, xp, streak, daily_goal, daily_progress, preferred_languages, skill_level, created_at FROM users WHERE id = ?;',
    [userId]
  );
  return res.json({ user: user || null });
});

router.patch('/profile', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { display_name, daily_goal, preferred_languages, skill_level } = req.body;
  await run(
    `UPDATE users SET 
      display_name = COALESCE(?, display_name),
      daily_goal = COALESCE(?, daily_goal),
      preferred_languages = COALESCE(?, preferred_languages),
      skill_level = COALESCE(?, skill_level)
     WHERE id = ?;`,
    [display_name, daily_goal, preferred_languages ? JSON.stringify(preferred_languages) : null, skill_level, userId]
  );

  const updated = await getOne('SELECT id, username, email, display_name, avatar, xp, streak, daily_goal, daily_progress, preferred_languages, skill_level, created_at FROM users WHERE id = ?;', [userId]);
  return res.json({ success: true, user: updated });
});

router.post('/logout', (req, res) => {
  return res.json({ success: true });
});

export default router;
