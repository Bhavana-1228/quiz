import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound';
import { ArrowLeft, Play, Sparkles, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export const LanguageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const language = SUPPORTED_LANGUAGES.find(l => l.slug === slug || l.id === slug);

  if (!language) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Language not found</h2>
        <Link to="/languages" className="text-sm font-semibold text-[#7657F6] underline">
          Back to all languages
        </Link>
      </div>
    );
  }

  const handleStartTopicQuiz = (topic: string) => {
    sound.playClick();
    navigate(`/quiz/setup?lang=${language.slug}&topic=${encodeURIComponent(topic)}`);
  };

  const handleStartGeneralQuiz = () => {
    sound.playClick();
    navigate(`/quiz/setup?lang=${language.slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/languages')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#7657F6] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Language Catalogue</span>
      </button>

      {/* Language Header Banner */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-md shrink-0"
            style={{ backgroundColor: `${language.color}15`, border: `2px solid ${language.color}40` }}
          >
            <span>{language.icon}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-[#1B2540] dark:text-white">{language.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#7657F6]/15 text-[#7657F6] border border-[#7657F6]/30">
                {language.category}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              {language.description}
            </p>
          </div>
        </div>

        <button
          onClick={handleStartGeneralQuiz}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7657F6] to-[#603FEF] text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#7657F6]/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Full Quiz</span>
        </button>
      </div>

      {/* Topics Catalogue Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1B2540] dark:text-white">
              Curated Topics for {language.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select a specialized domain to practice focused questions with zero repeats.
            </p>
          </div>
          <span className="text-xs font-mono text-[#39C6D8] font-bold">
            {language.topics.length} Available Topics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {language.topics.map(topic => {
            const freshCount = user ? db.getAvailableFreshCount(user.id, language.id, topic) : 5;
            return (
              <div
                key={topic}
                className="p-5 rounded-2xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] hover:border-[#7657F6]/50 shadow-sm hover:shadow-brand transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#1B2540] dark:text-white text-base group-hover:text-[#7657F6] transition-colors">
                      {topic}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                      {freshCount} fresh
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Master key {topic.toLowerCase()} concepts, patterns, syntax nuances, and standard practices.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#233354] flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">MCQ Quizzes</span>
                  <button
                    onClick={() => handleStartTopicQuiz(topic)}
                    className="px-4 py-1.5 rounded-xl bg-[#18243E] dark:bg-[#18243E] text-[#39C6D8] border border-[#233354] hover:bg-[#7657F6] hover:text-white hover:border-transparent text-xs font-bold uppercase transition-all"
                  >
                    Practice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

