import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../services/db';
import { sound } from '../services/sound';
import { 
  User, 
  Settings as SettingsIcon, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Bell, 
  ShieldAlert, 
  Download, 
  Trash2, 
  LogOut, 
  Check, 
  Key, 
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Difficulty } from '../types';

export const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { settings, updateSettings, theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name || user?.email?.split('@')[0] || 'Developer');
  const [geminiKey, setGeminiKey] = useState(settings.gemini_api_key || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearHistorySuccess, setClearHistorySuccess] = useState(false);

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    updateUser({ display_name: displayName });
    updateSettings({ gemini_api_key: geminiKey });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadData = () => {
    sound.playClick();
    const data = db.exportUserData(user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codequest_user_${user.display_name.toLowerCase()}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    sound.playClick();
    if (window.confirm('Are you sure you want to clear your answered questions history? This will allow you to see previous questions again as fresh questions.')) {
      db.clearUserHistory(user.id);
      setClearHistorySuccess(true);
      setTimeout(() => setClearHistorySuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2540] dark:text-white">
          Settings & Preferences
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
          Customize your profile, learning cadence, audio, appearance, and AI generation parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* 1. Profile Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7657F6]/15 text-[#7657F6] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2540] dark:text-white">Profile Details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Google profile name, email and avatar</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={user.avatar}
              alt={user.display_name}
              className="w-16 h-16 rounded-2xl ring-4 ring-[#7657F6]/20 object-cover"
            />
            <div className="w-full space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-sm text-[#1B2540] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7657F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <label className="text-gray-400 font-semibold uppercase">Google Email</label>
              <p className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0E1526] text-gray-600 dark:text-gray-300 font-mono mt-1">
                {user.email}
              </p>
            </div>
            <div>
              <label className="text-gray-400 font-semibold uppercase">Google Subject ID</label>
              <p className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0E1526] text-gray-600 dark:text-gray-300 font-mono truncate mt-1">
                {user.google_sub}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all hover:scale-105"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Learning Preferences */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#39C6D8]/15 text-[#39C6D8] flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2540] dark:text-white">Learning Preferences</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Default difficulty and daily question goal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Default Difficulty</label>
            <select
              value={settings.default_difficulty}
              onChange={e => updateSettings({ default_difficulty: e.target.value as Difficulty })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-sm text-[#1B2540] dark:text-white focus:ring-2 focus:ring-[#7657F6]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Daily Question Goal</label>
            <input
              type="number"
              min={3}
              max={50}
              value={user.daily_goal}
              onChange={e => updateUser({ daily_goal: parseInt(e.target.value) || 10 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-sm text-[#1B2540] dark:text-white focus:ring-2 focus:ring-[#7657F6]"
            />
          </div>
        </div>
      </div>

      {/* 3. Quiz Experience & Audio */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2540] dark:text-white">Quiz Experience & Sound</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Timer, answer explanations, and sound effects</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0E1526]">
            <div>
              <p className="font-semibold text-sm text-[#1B2540] dark:text-white">Quiz Timer</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Display elapsed time during quiz play</p>
            </div>
            <button
              onClick={() => updateSettings({ timer_enabled: !settings.timer_enabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.timer_enabled ? 'bg-[#7657F6]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.timer_enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0E1526]">
            <div>
              <p className="font-semibold text-sm text-[#1B2540] dark:text-white">Explanations</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Show detailed reasoning after each submitted answer</p>
            </div>
            <button
              onClick={() => updateSettings({ explanations_enabled: !settings.explanations_enabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.explanations_enabled ? 'bg-[#7657F6]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.explanations_enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0E1526]">
            <div>
              <p className="font-semibold text-sm text-[#1B2540] dark:text-white">Web Audio Sound Effects</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Audio chimes for correct and wrong submissions</p>
            </div>
            <button
              onClick={() => {
                const nextVal = !settings.sound_enabled;
                updateSettings({ sound_enabled: nextVal });
                if (nextVal) sound.playClick();
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.sound_enabled ? 'bg-[#39C6D8]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.sound_enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Appearance (Theme) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7657F6]/15 text-[#7657F6] flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2540] dark:text-white">Appearance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Design direction: Dark Navy (#10182B) + Violet (#7657F6) + Cyan (#39C6D8)</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['dark', 'light', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`p-3.5 rounded-2xl border text-xs font-bold capitalize transition-all ${
                theme === t
                  ? 'border-[#7657F6] bg-[#7657F6]/10 text-[#7657F6] dark:text-[#A28BFA] ring-2 ring-[#7657F6]/30'
                  : 'border-gray-200 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Google Gemini AI Generator API Key */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#39C6D8]/15 text-[#39C6D8] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2540] dark:text-white">AI Question Generation</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Optional Google Gemini API key for live AI questions synthesis</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            <span>Gemini API Key (Optional)</span>
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#233354] bg-white dark:bg-[#0E1526] text-sm text-[#1B2540] dark:text-white focus:ring-2 focus:ring-[#7657F6]"
          />
          <p className="text-[11px] text-gray-400">
            If left blank, CodeQuest uses high-yield built-in schema synthesis when fresh questions run low.
          </p>
        </div>
      </div>

      {/* 6. Privacy & Data */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1B2540] dark:text-white">Privacy & Data Management</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Download your records or reset your answered question history</p>
          </div>
        </div>

        {clearHistorySuccess && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold">
            Your answered question history has been cleared! All questions are now marked as unseen.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleDownloadData}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-[#0E1526] hover:bg-gray-200 dark:hover:bg-[#1C2A48] text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-gray-200 dark:border-[#233354] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Progress (JSON)</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Seen Questions</span>
          </button>
        </div>
      </div>

      {/* 7. Account Session & Sign Out */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141E34] border border-gray-200 dark:border-[#233354] shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#1B2540] dark:text-white">Signed in with Google</h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{user.email}</p>
        </div>

        <button
          onClick={logout}
          className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

