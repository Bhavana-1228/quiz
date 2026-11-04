import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/sound';
import { CodeBlock } from '../components/CodeBlock';
import { ReportModal } from '../components/ReportModal';
import { Question, QuizSession } from '../types';
import { 
  Clock, 
  Bookmark, 
  Flag, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const QuizPlay: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useTheme();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{
    isCorrect: boolean;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    xpEarned: number;
  } | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load session data
  useEffect(() => {
    if (!sessionId) return;
    const details = db.getSessionDetails(sessionId);
    if (!details || details.questions.length === 0) {
      navigate('/quiz/setup');
      return;
    }
    setSession(details.session);
    setQuestions(details.questions);
    setCurrentIndex(details.session.current_index || 0);
    setLoading(false);
  }, [sessionId, navigate]);

  // Timer interval
  useEffect(() => {
    if (!settings.timer_enabled) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.timer_enabled]);

  // Check if current question is bookmarked
  const currentQuestion = questions[currentIndex];
  useEffect(() => {
    if (user && currentQuestion) {
      const bookmarks = db.getBookmarkedQuestionIds(user.id);
      setIsBookmarked(bookmarks.includes(currentQuestion.id));
    }
  }, [user, currentQuestion]);

  if (loading || !session || !currentQuestion) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#7657F6] border-t-transparent animate-spin" />
      </div>
    );
  }

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    sound.playClick();
    setSelectedOption(option);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || isSubmitted) return;

    const res = await api.submitAnswer(session.id, {
      question_id: currentQuestion.id,
      selected_answer: selectedOption,
      time_spent_seconds: elapsedSeconds,
    });

    if (res.is_correct) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    setSubmissionResult({
      isCorrect: res.is_correct,
      correctAnswer: res.correct_answer,
      explanation: res.explanation,
      xpEarned: res.xp_earned,
    });
    setIsSubmitted(true);
  };

  const handleNextQuestion = async () => {
    sound.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setSubmissionResult(null);
    } else {
      // Quiz complete!
      await api.completeQuizSession(session.id, elapsedSeconds);
      sound.playComplete();
      navigate(`/results/${session.id}`);
    }
  };

  const handleToggleBookmark = () => {
    if (!user) return;
    const newState = db.toggleBookmark(user.id, currentQuestion.id);
    setIsBookmarked(newState);
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-fadeIn pb-24 md:pb-12">
      
      {/* Top Header Bar (Matching Figma Page 6) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2540] dark:text-white">
              Question {currentIndex + 1} of {questions.length}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span className="capitalize">{currentQuestion.language_id}</span>
              <span>•</span>
              <span>{currentQuestion.topic}</span>
              <span>•</span>
              <span>{currentQuestion.difficulty}</span>
              {settings.timer_enabled && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#39C6D8] font-mono font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimer(elapsedSeconds)} elapsed
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Question Action Controls (Bookmark & Report) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this question'}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isBookmarked
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                  : 'bg-white dark:bg-[#141E34] border-gray-200 dark:border-[#233354] text-gray-400 hover:text-amber-500'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              title="Report incorrect AI content"
              className="p-2.5 rounded-xl border border-gray-200 dark:border-[#233354] bg-white dark:bg-[#141E34] text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        </div>

        {/* Progress Bar in Cyan (#39C6D8) */}
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-[#141E34] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7657F6] to-[#39C6D8] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-4">
        
        <p className="text-lg sm:text-xl font-semibold text-[#1B2540] dark:text-white leading-relaxed">
          {currentQuestion.prompt}
        </p>

        {/* Code Snippet if present */}
        {currentQuestion.code && (
          <CodeBlock code={currentQuestion.code} language={currentQuestion.language_id} />
        )}
      </div>

      {/* 4 Interactive Option Cards (Figma Page 6 2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map(option => {
          const isSelected = selectedOption === option.label;
          const isCorrect = submissionResult?.correctAnswer === option.label;
          const isUserWrong = isSubmitted && isSelected && !submissionResult?.isCorrect;

          let cardStyle = 'border-gray-200 dark:border-[#233354] bg-white dark:bg-[#141E34] hover:border-[#7657F6]/50';
          let badgeStyle = 'bg-gray-100 dark:bg-[#0E1526] text-gray-600 dark:text-gray-300';

          if (isSelected && !isSubmitted) {
            cardStyle = 'border-[#7657F6] ring-2 ring-[#7657F6]/30 bg-[#7657F6]/5 dark:bg-[#7657F6]/10';
            badgeStyle = 'bg-[#7657F6] text-white';
          } else if (isSubmitted) {
            if (isCorrect) {
              cardStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30';
              badgeStyle = 'bg-emerald-500 text-white';
            } else if (isUserWrong) {
              cardStyle = 'border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30';
              badgeStyle = 'bg-rose-500 text-white';
            } else {
              cardStyle = 'opacity-60 border-gray-200 dark:border-[#233354] bg-white dark:bg-[#141E34]';
            }
          }

          return (
            <div
              key={option.label}
              onClick={() => handleSelectOption(option.label)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${cardStyle} shadow-sm group`}
            >
              <div className="flex items-start gap-3.5">
                <span className={`w-8 h-8 rounded-xl font-bold font-mono text-sm flex items-center justify-center shrink-0 transition-colors ${badgeStyle}`}>
                  {option.label}
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-[#1B2540] dark:text-white text-base">
                    {option.text}
                  </p>
                  {option.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Status indicator on submit */}
              {isSubmitted && isCorrect && (
                <div className="mt-4 pt-2 border-t border-emerald-500/20 flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct Answer</span>
                </div>
              )}
              {isSubmitted && isUserWrong && (
                <div className="mt-4 pt-2 border-t border-rose-500/20 flex items-center gap-1.5 text-xs font-bold text-rose-500">
                  <XCircle className="w-4 h-4" />
                  <span>Your Selection</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation Banner (Revealed ONLY after submission as specified in brief) */}
      {isSubmitted && submissionResult && (
        <div className={`p-6 rounded-3xl border animate-fadeIn space-y-3 ${
          submissionResult.isCorrect
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {submissionResult.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-indigo-400" />
              )}
              <h4 className="font-bold text-base">
                {submissionResult.isCorrect ? 'Nicely done! (+15 XP)' : 'Explanation & Nuance (+5 XP)'}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/20">
              Answer: {submissionResult.correctAnswer}
            </span>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {submissionResult.explanation}
          </p>
        </div>
      )}

      {/* Bottom Sticky Action Area (Page 10 Mobile Friendly) */}
      <div className="sticky bottom-16 md:bottom-6 z-30 pt-4 flex items-center justify-between gap-4 bg-gradient-to-t from-[#F4F6FB] via-[#F4F6FB] dark:from-[#10182B] dark:via-[#10182B] to-transparent pb-2">
        <span className="text-xs text-gray-400 hidden sm:inline">
          {isSubmitted ? 'Review explanation then continue' : 'Select an answer to proceed'}
        </span>

        <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
          {!isSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#7657F6] hover:bg-[#6543F4] text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#7657F6]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#7657F6] to-[#39C6D8] hover:shadow-xl text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {user && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          questionId={currentQuestion.id}
          userId={user.id}
        />
      )}
    </div>
  );
};

