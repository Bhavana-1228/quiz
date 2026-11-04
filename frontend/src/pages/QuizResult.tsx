import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound';
import { CodeBlock } from '../components/CodeBlock';
import { Question, QuizSession, UserAnswer } from '../types';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Bookmark, 
  AlertTriangle,
  Flame
} from 'lucide-react';

export const QuizResult: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    const details = db.getSessionDetails(sessionId);
    if (!details) {
      navigate('/');
      return;
    }
    setSession(details.session);
    setQuestions(details.questions);
    setAnswers(details.answers);

    if (user) {
      setBookmarkedIds(db.getBookmarkedQuestionIds(user.id));
    }

    const accuracy = details.session.question_count > 0
      ? (details.session.score / details.session.question_count) * 100
      : 0;

    if (accuracy >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7657F6', '#39C6D8', '#FFD700', '#FFFFFF'],
      });
    }
  }, [sessionId, navigate, user]);

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#7657F6] border-t-transparent animate-spin" />
      </div>
    );
  }

  const accuracy = session.question_count > 0
    ? Math.round((session.score / session.question_count) * 100)
    : 0;

  const totalXP = session.score * 15 + (session.question_count - session.score) * 5;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const handleToggleBookmark = (questionId: string) => {
    if (!user) return;
    const isNow = db.toggleBookmark(user.id, questionId);
    if (isNow) {
      setBookmarkedIds(prev => [...prev, questionId]);
    } else {
      setBookmarkedIds(prev => prev.filter(id => id !== questionId));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Top Congratulatory Scorecard */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#7657F6]/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#7657F6] to-[#39C6D8] flex items-center justify-center shadow-lg shadow-[#7657F6]/30 text-white">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-mono tracking-widest text-[#39C6D8] font-bold">
            Session Completed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B2540] dark:text-white">
            {accuracy >= 80 ? 'Outstanding Performance!' : accuracy >= 50 ? 'Great Practice Session!' : 'Keep Learning & Pushing!'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {session.language_id.toUpperCase()} • {session.topic || 'General'} • {session.difficulty}
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0E1526] border border-gray-200 dark:border-[#233354]">
            <p className="text-xs text-gray-400">Score</p>
            <p className="text-xl sm:text-2xl font-black text-[#1B2540] dark:text-white">
              {session.score}/{session.question_count}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0E1526] border border-gray-200 dark:border-[#233354]">
            <p className="text-xs text-gray-400">Accuracy</p>
            <p className="text-xl sm:text-2xl font-black text-[#39C6D8]">
              {accuracy}%
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0E1526] border border-gray-200 dark:border-[#233354]">
            <p className="text-xs text-gray-400">XP Gained</p>
            <p className="text-xl sm:text-2xl font-black text-[#7657F6]">
              +{totalXP}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              navigate(`/quiz/setup?lang=${session.language_id}&topic=${session.topic || ''}`);
            }}
            className="px-6 py-3 rounded-2xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#7657F6]/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Next Fresh Quiz</span>
          </button>

          <Link
            to="/"
            className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-[#18243E] hover:bg-gray-200 dark:hover:bg-[#233354] text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/progress"
            className="px-6 py-3 rounded-2xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>View Analytics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* In-Depth Question Breakdown & Explanations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1B2540] dark:text-white">
            Question & Answer Breakdown
          </h2>
          <span className="text-xs text-gray-400">
            {questions.length} Questions Reviewed
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAns = answers.find(a => a.question_id === q.id);
            const isCorrect = userAns?.is_correct;
            const bookmarked = bookmarkedIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isCorrect
                    ? 'border-gray-200 dark:border-[#233354] bg-white dark:bg-[#141E34]'
                    : 'border-rose-300 dark:border-rose-950/60 bg-rose-500/5 dark:bg-[#171A2E]'
                } shadow-sm space-y-4`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-lg font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                      isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                        {q.topic} • {q.difficulty}
                      </span>
                      <p className="text-base font-semibold text-[#1B2540] dark:text-white mt-0.5">
                        {q.prompt}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(q.id)}
                    className={`p-2 rounded-xl border text-xs transition-colors shrink-0 ${
                      bookmarked
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                        : 'border-gray-200 dark:border-[#233354] text-gray-400 hover:text-amber-500'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                {q.code && <CodeBlock code={q.code} language={q.language_id} />}

                {/* Answers Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    <span>Your Answer: <strong>{userAns?.selected_answer || 'None'}</strong></span>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Correct Answer: <strong>{q.answer}</strong> ({q.options.find(o => o.label === q.answer)?.text})</span>
                  </div>
                </div>

                {/* Detailed Explanation */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0E1526] border border-gray-200 dark:border-[#233354] text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="font-bold text-[#7657F6] dark:text-[#A28BFA] uppercase tracking-wider text-[10px]">
                    Why this answer is correct
                  </p>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

