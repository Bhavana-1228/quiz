import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, ALL_TOPICS } from '../data/languages';
import { Difficulty, QuestionTopic } from '../types';
import { db } from '../services/db';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound';
import { 
  Sparkles, 
  Layers, 
  Gauge, 
  HelpCircle, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export const QuizSetup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialLang = searchParams.get('lang') || 'python';
  const initialTopic = (searchParams.get('topic') as QuestionTopic) || 'OOP';
  const modeParam = searchParams.get('mode') as 'fresh' | 'review' | 'daily_challenge' | null;

  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);
  const [selectedTopic, setSelectedTopic] = useState<QuestionTopic | 'All'>(initialTopic);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [freshOnly, setFreshOnly] = useState<boolean>(modeParam !== 'review');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const langObj = SUPPORTED_LANGUAGES.find(l => l.slug === selectedLanguage || l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Calculate fresh questions count
  const freshCount = user
    ? db.getAvailableFreshCount(
        user.id,
        langObj.id,
        selectedTopic === 'All' ? undefined : selectedTopic,
        selectedDifficulty
      )
    : 10;

  const handleStartQuiz = async () => {
    if (!user) return;
    sound.playClick();
    setLoading(true);
    setErrorMsg(null);

    try {
      const mode = freshOnly ? (modeParam === 'daily_challenge' ? 'daily_challenge' : 'fresh') : 'review';

      const res = await api.createQuizSession({
        language_id: langObj.id,
        topic: selectedTopic === 'All' ? undefined : selectedTopic,
        difficulty: selectedDifficulty,
        question_count: questionCount,
        mode,
      });

      navigate(`/quiz/${res.session_id}`);
    } catch (err: any) {
      if (err.message === 'NO_UNSEEN_QUESTIONS') {
        setErrorMsg('You have completed all available approved questions for this exact combination! Switch topics or enable Review mode to practice previously seen questions.');
      } else {
        setErrorMsg(err.message || 'Failed to start quiz session.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Top Header (Matches Figma Screen Page 5) */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2540] dark:text-white">
          Configure your quiz
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
          {langObj.name} • Select a topic and challenge level
        </p>
      </div>

      {/* Language Quick Dropdown */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{langObj.icon}</span>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Target Language</label>
            <p className="text-base font-bold text-[#1B2540] dark:text-white">{langObj.name}</p>
          </div>
        </div>

        <select
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1526] border border-gray-300 dark:border-[#233354] text-sm font-semibold text-[#1B2540] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7657F6]"
        >
          {SUPPORTED_LANGUAGES.map(l => (
            <option key={l.id} value={l.slug}>
              {l.name} ({l.category})
            </option>
          ))}
        </select>
      </div>

      {/* Main 4 Figma Brief Cards (Page 5 Mockup Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Topic */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#39C6D8]/20 text-[#39C6D8] flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1B2540] dark:text-white">
                  Topic: {selectedTopic}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Classes, objects, inheritance & functions
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#233354]">
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0E1526] border border-gray-300 dark:border-[#233354] text-xs font-semibold text-[#1B2540] dark:text-white focus:ring-2 focus:ring-[#7657F6]"
            >
              <option value="All">All Topics (Comprehensive)</option>
              {ALL_TOPICS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Card 2: Difficulty */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7657F6]/20 text-[#7657F6] flex items-center justify-center shrink-0">
              <Gauge className="w-6 h-6" />
            </div>
            <div className="space-y-1 w-full">
              <h3 className="text-lg font-bold text-[#1B2540] dark:text-white">
                Difficulty: {selectedDifficulty}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Adjust challenge level
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center gap-2">
            {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-[#7657F6] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-[#0E1526] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#18243E]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Question count */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7657F6]/20 text-[#7657F6] flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 w-full">
              <h3 className="text-lg font-bold text-[#1B2540] dark:text-white">
                {questionCount} questions
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                5 • 10 • 15 • 20
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center gap-2">
            {[5, 10, 15, 20].map(cnt => (
              <button
                key={cnt}
                onClick={() => setQuestionCount(cnt)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  questionCount === cnt
                    ? 'bg-[#7657F6] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-[#0E1526] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#18243E]'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        {/* Card 4: Fresh questions only */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#39C6D8]/20 text-[#39C6D8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1 w-full">
              <h3 className="text-lg font-bold text-[#1B2540] dark:text-white">
                {freshOnly ? 'Fresh questions only' : 'Review Mode'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {freshOnly ? 'Previously answered items excluded' : 'Practice tricky & previously answered questions'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {freshCount} fresh in bank
            </span>

            <button
              onClick={() => setFreshOnly(!freshOnly)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                freshOnly
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {freshOnly ? 'Active (Strict No-Repeat)' : 'Deliberate Review'}
            </button>
          </div>
        </div>
      </div>

      {/* Error / Warning Alert */}
      {errorMsg && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-500 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Notice regarding fresh questions:</p>
            <p className="text-gray-700 dark:text-gray-300 text-xs">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Launch Action Button */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#39C6D8]" />
          <span>Questions are recorded in database on delivery to guarantee zero repeats.</span>
        </div>

        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-[#7657F6] to-[#603FEF] hover:shadow-xl hover:shadow-[#7657F6]/40 text-white font-bold text-sm tracking-wide uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Preparing Fresh Session...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>START QUIZ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

