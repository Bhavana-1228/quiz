import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound';
import { 
  Play, 
  Flame, 
  Sparkles, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  Layers, 
  Compass, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { db } from '../services/db';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Developer';
  const dailyGoal = user?.daily_goal || 10;
  const dailyProgress = user?.daily_progress || 0;
  const progressPercent = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100));

  const stats = user ? db.getUserProgress(user.id) : null;

  const handleOpenQuiz = (route: string) => {
    sound.playClick();
    navigate(route);
  };

  const handleQuickDailyChallenge = async () => {
    sound.playClick();
    navigate('/quiz/setup?mode=daily_challenge');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Top Banner / Welcome Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2540] dark:text-white">
              Welcome back, {displayName}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium mt-1 flex items-center gap-2">
              <span>Pick up where you left off</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-[#7657F6] dark:text-[#A28BFA] font-semibold">
                Daily goal: {dailyGoal} questions
              </span>
            </p>
          </div>

          {/* Quick Streak & XP widget */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
                <p className="text-sm font-bold text-[#1B2540] dark:text-white">{user?.streak || 1} Days</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-[#7657F6]/15 flex items-center justify-center text-[#7657F6]">
                <Sparkles className="w-5 h-5 text-[#39C6D8]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                <p className="text-sm font-bold text-[#1B2540] dark:text-white">{user?.xp || 340} XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#39C6D8]/15 flex items-center justify-center text-[#39C6D8] shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Daily Practice Goal
              </p>
              <p className="text-sm font-bold text-[#1B2540] dark:text-white">
                {dailyProgress} of {dailyGoal} questions answered today ({progressPercent}%)
              </p>
            </div>
          </div>

          <div className="w-full sm:w-72 flex items-center gap-3">
            <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-[#0E1526] overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#7657F6] to-[#39C6D8] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {dailyProgress >= dailyGoal && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 shrink-0">
                <CheckCircle className="w-4 h-4" /> Goal Met!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main 4 Action Cards Grid (Exact Figma brief Section 2 page 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Continue Learning */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card hover:shadow-brand transition-all flex flex-col justify-between group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#39C6D8]/20 text-[#39C6D8] flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1B2540] dark:text-white">
                Continue learning
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Python • Functions • 6/10 complete
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">Resume session</span>
            <button
              onClick={() => handleOpenQuiz('/quiz/setup?lang=python&topic=Functions')}
              className="px-6 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-[#7657F6]/30 transition-all flex items-center gap-2 group-hover:scale-105"
            >
              <span>OPEN QUIZ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Daily Challenge */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card hover:shadow-brand transition-all flex flex-col justify-between group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7657F6]/20 text-[#7657F6] flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1B2540] dark:text-white">
                Daily challenge
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                A fresh mixed-language quiz
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">Bonus XP boost</span>
            <button
              onClick={handleQuickDailyChallenge}
              className="px-6 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-[#7657F6]/30 transition-all flex items-center gap-2 group-hover:scale-105"
            >
              <span>OPEN QUIZ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 3: Choose a Language */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card hover:shadow-brand transition-all flex flex-col justify-between group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7657F6]/20 text-[#7657F6] flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1B2540] dark:text-white">
                Choose a language
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Explore the full language library
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">16+ languages</span>
            <button
              onClick={() => handleOpenQuiz('/languages')}
              className="px-6 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-[#7657F6]/30 transition-all flex items-center gap-2 group-hover:scale-105"
            >
              <span>OPEN QUIZ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 4: Your Progress */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card hover:shadow-brand transition-all flex flex-col justify-between group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#39C6D8]/20 text-[#39C6D8] flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1B2540] dark:text-white">
                Your progress
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Accuracy, streak and XP points
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">Analytics & history</span>
            <button
              onClick={() => handleOpenQuiz('/progress')}
              className="px-6 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-[#7657F6]/30 transition-all flex items-center gap-2 group-hover:scale-105"
            >
              <span>OPEN QUIZ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weak Topics Alert / Insight if any */}
      {stats && stats.weak_topics.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase text-amber-500">Weak-Topic Practice Recommendation</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                You have {stats.weak_topics[0].accuracy}% accuracy in <strong>{stats.weak_topics[0].topic}</strong>. Review this topic with fresh questions!
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenQuiz(`/quiz/setup?topic=${encodeURIComponent(stats.weak_topics[0].topic)}`)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shrink-0"
          >
            Practice Topic
          </button>
        </div>
      )}
    </div>
  );
};

