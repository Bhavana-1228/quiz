import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/db';
import { sound } from '../services/sound';
import { UserSettings } from '../types';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => db.getSettings());
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    sound.setEnabled(settings.sound_enabled);
  }, [settings.sound_enabled]);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let darkActive = false;
      if (settings.theme === 'dark') {
        darkActive = true;
      } else if (settings.theme === 'light') {
        darkActive = false;
      } else {
        darkActive = mediaQuery.matches;
      }

      setIsDark(darkActive);
      if (darkActive) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const listener = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.theme]);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    const updated = db.updateSettings({ theme });
    setSettings(updated);
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const updated = db.updateSettings(updates);
    setSettings(updated);
  };

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, isDark, setTheme, settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

