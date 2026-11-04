import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound';

export const Languages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Web', 'Backend', 'Systems', 'Mobile', 'Data/AI', 'Scripting'];

  const filtered = SUPPORTED_LANGUAGES.filter(lang => {
    const matchesSearch =
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || lang.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenQuiz = (langSlug: string) => {
    sound.playClick();
    navigate(`/quiz/setup?lang=${langSlug}`);
  };

  const handleOpenLanguageDetail = (langSlug: string) => {
    sound.playClick();
    navigate(`/languages/${langSlug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Page Header (Matches Figma Screen Page 4) */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2540] dark:text-white">
            Choose a language
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
            Search languages or browse by category
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between pt-2">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Python, JavaScript, Rust..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-[#233354] bg-white dark:bg-[#141E34] text-sm text-[#1B2540] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7657F6] shadow-sm"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#7657F6] text-white shadow-md shadow-[#7657F6]/20'
                    : 'bg-white dark:bg-[#141E34] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#233354] hover:bg-gray-50 dark:hover:bg-[#18243E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Language Grid (Figma Page 4 cards with [OPEN QUIZ] buttons) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(lang => {
          const freshCount = user ? db.getAvailableFreshCount(user.id, lang.id) : 10;
          return (
            <div
              key={lang.id}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card hover:shadow-brand transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0"
                    style={{ backgroundColor: `${lang.color}15`, border: `1px solid ${lang.color}30` }}
                  >
                    <span>{lang.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 
                        onClick={() => handleOpenLanguageDetail(lang.slug)}
                        className="text-xl font-bold text-[#1B2540] dark:text-white hover:text-[#7657F6] cursor-pointer transition-colors"
                      >
                        {lang.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-gray-100 dark:bg-[#0E1526] text-gray-600 dark:text-gray-300">
                        {lang.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2">
                      {lang.description}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end text-xs font-mono text-gray-400">
                  <span className="text-[#39C6D8] font-bold">{freshCount} fresh</span>
                  <span>questions</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 dark:border-[#233354] flex items-center justify-between">
                <button
                  onClick={() => handleOpenLanguageDetail(lang.slug)}
                  className="text-xs font-semibold text-[#7657F6] dark:text-[#A28BFA] hover:underline flex items-center gap-1"
                >
                  <span>View Topics ({lang.topics.length})</span>
                </button>

                <button
                  onClick={() => handleOpenQuiz(lang.slug)}
                  className="px-6 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-[#7657F6]/30 transition-all flex items-center gap-2 group-hover:scale-105"
                >
                  <span>OPEN QUIZ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#141E34] rounded-3xl border border-gray-200 dark:border-[#233354] p-8 space-y-3">
          <p className="text-gray-400 text-sm">No programming languages found matching "{search}".</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="text-xs font-semibold text-[#7657F6] underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

