import React from 'react';
import { Sparkles, Terminal, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-[#1E2C48] bg-white dark:bg-[#0E1526] text-gray-500 dark:text-gray-400 py-8 px-4 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-[#7657F6]" />
          <span className="font-semibold text-gray-700 dark:text-gray-200">CODEQUEST</span>
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <span>AI-Powered Programming Quiz Platform</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#39C6D8]" /> Guaranteed No-Repeat System
          </span>
          <span>•</span>
          <span>Dark Navy + Violet + Cyan Theme</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </span>
        </div>
      </div>
    </footer>
  );
};

