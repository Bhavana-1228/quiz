import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { sound } from '../services/sound';
import { 
  BarChart3, 
  Flame, 
  Sparkles, 
  Trophy, 
  Bookmark, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Play,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';

export const Progress: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks'>('overview');

  if (!user) return null;

  const stats = db.getUserProgress(user.id);
  const bookmarkedIds = db.getBookmarkedQuestionIds(user.id);
  const allQuestions = db.getAllQuestions();
  const bookmarkedQuestions = allQuestions.filter(q => bookmarkedIds.includes(q.id));

  const handleStartReviewQuiz = () => {
    sound.playClick();
    navigate('/quiz/setup?mode=review');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2540] dark:text-white">
            Progress & Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
            Track your accuracy, learning streak, XP levels, and bookmarked questions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#7657F6] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-[#7657F6] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Bookmarks ({bookmarkedQuestions.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Accuracy */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#39C6D8]/15 text-[#39C6D8] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Overall Accuracy</p>
              <p className="text-2xl sm:text-3xl font-black text-[#1B2540] dark:text-white">
                {stats.accuracy}%
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {stats.total_correct} correct / {stats.total_answered} answered
              </p>
            </div>

            {/* Streak */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Daily Streak</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">
                {stats.current_streak} Days
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Best streak: {stats.best_streak} days
              </p>
            </div>

            {/* Total XP */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#7657F6]/15 text-[#7657F6] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Total Experience</p>
              <p className="text-2xl sm:text-3xl font-black text-[#7657F6]">
                {stats.xp} XP
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Level {stats.level} Developer
              </p>
            </div>

            {/* Completed Quizzes */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Quizzes Finished</p>
              <p className="text-2xl sm:text-3xl font-black text-[#1B2540] dark:text-white">
                {stats.quizzes_completed}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Zero repeated questions
              </p>
            </div>
          </div>

          {/* Weak-Topic Insights Card (Section 5 Requirement) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2540] dark:text-white">
                    Weak-Topic Insights
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Targeted practice recommendations based on topics where your accuracy is below 75%
                  </p>
                </div>
              </div>
            </div>

            {stats.weak_topics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {stats.weak_topics.map((wt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0E1526] border border-gray-200 dark:border-[#233354] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[#1B2540] dark:text-white text-sm">{wt.topic}</p>
                      <p className="text-xs text-amber-500 font-semibold">{wt.accuracy}% accuracy ({wt.count} attempts)</p>
                    </div>
                    <button
                      onClick={() => navigate(`/quiz/setup?topic=${encodeURIComponent(wt.topic)}`)}
                      className="px-3 py-1.5 rounded-xl bg-[#7657F6] text-white text-xs font-bold hover:bg-[#6543F4] transition-colors"
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All tested topics are above 75% accuracy! Great mastery across concepts.</span>
              </div>
            )}
          </div>

          {/* Topic-by-Topic Mastery Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-4">
            <h3 className="text-lg font-bold text-[#1B2540] dark:text-white">
              Topic Mastery Breakdown
            </h3>

            {Object.keys(stats.topic_stats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.topic_stats).map(([topic, stat]) => {
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#1B2540] dark:text-white">{topic}</span>
                        <span className="text-gray-400 font-mono">
                          {stat.correct}/{stat.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-[#0E1526] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7657F6] to-[#39C6D8] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4">No completed topics yet. Start a quiz from Home or Languages to build your topic mastery record!</p>
            )}
          </div>
        </>
      ) : (
        /* Bookmarks Tab */
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1B2540] dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                Bookmarked Questions Review
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review your saved questions at any time. Deliberate review mode lets you practice without altering your fresh question history.
              </p>
            </div>

            {bookmarkedQuestions.length > 0 && (
              <button
                onClick={handleStartReviewQuiz}
                className="px-6 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Practice Bookmarks</span>
              </button>
            )}
          </div>

          {bookmarkedQuestions.length > 0 ? (
            <div className="space-y-4">
              {bookmarkedQuestions.map(q => (
                <div
                  key={q.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#39C6D8] uppercase">
                      {q.language_id} • {q.topic} • {q.difficulty}
                    </span>
                    <button
                      onClick={() => {
                        db.toggleBookmark(user.id, q.id);
                        window.location.reload();
                      }}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove Bookmark
                    </button>
                  </div>

                  <p className="text-base font-semibold text-[#1B2540] dark:text-white">
                    {q.prompt}
                  </p>

                  {q.code && <CodeBlock code={q.code} language={q.language_id} />}

                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#0E1526] border border-gray-200 dark:border-[#233354] text-xs">
                    <span className="font-bold text-emerald-500">Correct Answer: {q.answer}</span>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{q.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#141E34] rounded-3xl border border-gray-200 dark:border-[#233354] p-8 space-y-3">
              <Bookmark className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No bookmarked questions yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                During any quiz, click the bookmark icon to save tricky questions for dedicated review!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

