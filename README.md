# CODEQUEST — AI-Powered Programming Language Quiz Platform

> Architected according to the **CODEQUEST UI/UX Frontend Design Brief & Architecture Specification**.

CodeQuest is a modern developer-learning platform with **separated Frontend & Backend architecture**, **real SQLite Database integration**, **Sign In & Sign Up flows**, and **strict backend-enforced no-repeat question delivery**.

---

## 📁 Project Architecture

The project is structured into clean, separated directories:

```
├── backend/                       # Express REST API & SQLite Database
│   ├── codequest.db               # SQLite database file
│   ├── db/
│   │   └── database.js            # SQLite schema, tables & password hashing
│   ├── routes/
│   │   ├── auth.routes.js         # Sign In, Sign Up, Google OAuth, Profile
│   │   ├── languages.routes.js    # Languages catalogue and topics
│   │   ├── quiz.routes.js         # Session creation, answer grading, completion
│   │   ├── progress.routes.js     # User stats, streak, accuracy, weak topics
│   │   ├── bookmarks.routes.js    # Bookmark and review endpoints
│   │   ├── reports.routes.js      # Question quality audit reports
│   │   ├── settings.routes.js     # User preferences & Gemini API key
│   │   └── admin.routes.js        # AI candidate generation and bank audits
│   ├── seedData.js                # Initial languages & questions seed data
│   ├── server.js                  # Express API server entrypoint (port 5000)
│   └── package.json
│
├── frontend/                      # React 19 + TypeScript + Vite 6 + Tailwind CSS
│   ├── src/
│   │   ├── components/            # Navbar, Footer, CodeBlock, ReportModal, ProtectedRoute
│   │   ├── context/               # AuthContext (Sign In, Sign Up, Google), ThemeContext
│   │   ├── pages/
│   │   │   ├── Login.tsx          # Sign In & Sign Up tabs, Google OAuth, Onboarding
│   │   │   ├── Home.tsx           # Dashboard, continue learning, daily goal
│   │   │   ├── Languages.tsx      # 18+ languages catalogue and search
│   │   │   ├── LanguageDetail.tsx # Topics breakdown per language
│   │   │   ├── QuizSetup.tsx      # Configure language, topic, difficulty, fresh toggle
│   │   │   ├── QuizPlay.tsx       # Question play, 4 options, timer, bookmarks
│   │   │   ├── QuizResult.tsx     # Result scorecard, explanations, confetti
│   │   │   ├── Progress.tsx       # Accuracy, streak, weak-topic insights, bookmarks
│   │   │   ├── Settings.tsx       # Preferences, audio, theme, Gemini key
│   │   │   └── AdminReview.tsx    # Candidate questions generator and approval
│   │   ├── services/              # API client, Sound synthesizer, AI generator
│   │   └── types/                 # TypeScript models and interfaces
│   ├── vite.config.ts             # Proxies /api requests to http://127.0.0.1:5000
│   ├── tailwind.config.js         # Dark Navy (#10182B), Violet (#7657F6), Cyan (#39C6D8)
│   └── package.json
│
├── package.json                   # Root orchestrator with concurrent scripts
└── README.md
```

---

## 🎨 Design System & Visual Palette
- **Navy**: `#10182B` (App Shell, Dark Theme, Header Navigation)
- **Violet**: `#7657F6` (Primary Action Color, Buttons, Highlights)
- **Cyan**: `#39C6D8` (Progress Bars, Timer, Badges, Highlights)
- **Background**: `#F4F6FB` (Soft Neutral Surfaces, Cards)
- **Text**: `#1B2540` / `#F1F5F9` (High Contrast Readable Typography)

---

## 🔐 Authentication & Onboarding
1. **Sign In Option**:
   - One-Click **Google Sign-In** with Google Identity Services (`@react-oauth/google`)
   - Direct **Email & Password** Sign-In with secure hash verification
2. **Sign Up Option**:
   - One-Click **Google Sign-Up**
   - Direct **Email & Password** registration
   - **Interactive Developer Onboarding**:
     - Primary language selection (Python, JavaScript, TypeScript, Rust, Go, SQL, etc.)
     - Skill level selection (Beginner, Intermediate, Advanced)
     - Daily question practice goal (5, 10, 15, 20 questions)

---

## 🗄️ SQLite Database Schema (`backend/codequest.db`)
- `users`: `id`, `google_sub`, `email` (UNIQUE), `password_hash`, `display_name`, `avatar`, `xp`, `streak`, `daily_goal`, `daily_progress`, `preferred_languages`, `skill_level`
- `languages`: `id`, `name`, `slug` (UNIQUE), `category`, `icon`, `color`, `description`, `topics`
- `questions`: `id`, `language_id`, `topic`, `difficulty`, `prompt`, `code`, `options`, `answer`, `explanation`, `status`
- `user_question_history`: `id`, `user_id`, `question_id`, `first_seen_at`, `answered_at`, `selected_answer`, `is_correct`
  - **`UNIQUE(user_id, question_id)`**: Strictly guarantees zero repeated questions!
- `quiz_sessions`: `id`, `user_id`, `language_id`, `topic`, `difficulty`, `question_count`, `question_ids`, `score`, `started_at`, `completed_at`, `elapsed_seconds`, `mode`
- `user_answers`: `id`, `session_id`, `question_id`, `selected_answer`, `is_correct`, `answered_at`, `time_spent_seconds`
- `bookmarks`: `id`, `user_id`, `question_id`, `created_at` (UNIQUE)
- `reports`: `id`, `user_id`, `question_id`, `reason`, `details`, `created_at`
- `settings`: `user_id`, `timer_enabled`, `explanations_enabled`, `sound_enabled`, `theme`, `font_size`, `gemini_api_key`

---

## 🔌 REST API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/signup` | Register new account with password & onboarding |
| | `POST` | `/api/auth/signin` | Sign in with email and password |
| | `POST` | `/api/auth/google` | Sign in / sign up with Google account |
| | `GET` | `/api/auth/me` | Fetch active authenticated profile |
| | `PATCH` | `/api/auth/profile` | Update user preferences, goal, or name |
| | `POST` | `/api/auth/logout` | Terminate session |
| **Languages** | `GET` | `/api/languages` | Return all 18+ languages and topics |
| | `GET` | `/api/languages/:slug` | Return language details and topic breakdown |
| **Quiz** | `POST` | `/api/quiz-sessions` | Create quiz session with SQL no-repeat filtering |
| | `GET` | `/api/quiz-sessions/:id` | Fetch session details and delivered questions |
| | `POST` | `/api/quiz-sessions/:id/answers` | Submit answer and receive explanation + XP |
| | `POST` | `/api/quiz-sessions/:id/complete` | Finalize session score and elapsed time |
| **Progress** | `GET` | `/api/progress` | Return accuracy %, streak, XP, and weak topics |
| **Bookmarks** | `GET` | `/api/bookmarks` | Get bookmarked question IDs |
| | `POST` | `/api/bookmarks/toggle` | Bookmark/unbookmark a question |
| **Reports** | `POST` | `/api/reports` | Submit issue report for question auditing |
| **Admin** | `GET` | `/api/admin/questions` | View all questions in database |
| | `POST` | `/api/admin/questions/:id/status` | Approve or retire candidate questions |
| | `POST` | `/api/admin/generate` | Synthesize candidate AI questions |
| | `POST` | `/api/admin/clear-history` | Reset user question history |

---

## 💻 Commands to Run the Project

Both servers are currently active:
- **Frontend**: `http://127.0.0.1:5173/`
- **Backend**: `http://127.0.0.1:5000/`

To start manually from the root directory:
```bash
# Start both Backend and Frontend together:
npm run dev

# Or run separately:
npm run backend    # Runs Express API on port 5000
npm run frontend   # Runs Vite React App on port 5173
```
