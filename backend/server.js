import express from 'express';
import cors from 'cors';
import { initDb } from './db/database.js';

import authRoutes from './routes/auth.routes.js';
import languagesRoutes from './routes/languages.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import progressRoutes from './routes/progress.routes.js';
import bookmarksRoutes from './routes/bookmarks.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount REST API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/quiz-sessions', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), database: 'SQLite codequest.db' });
});

// Initialize database schema and start server
initDb()
  .then(() => {
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`CodeQuest Express REST API Server live on http://127.0.0.1:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize SQLite database:', err);
    process.exit(1);
  });
