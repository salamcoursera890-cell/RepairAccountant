import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, AppTheme } from '../theme';
import { AppSettings } from '../models';
import { api } from '../services/api';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  isLoaded: boolean;
}

const defaultSettings: AppSettings = {
  isDarkMode: false,
  language: 'ar',
  currency: 'ل.س',
  repairCounter: 0,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  settings: defaultSettings,
  updateSettings: () => {},
  isLoaded: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await api.settings.get();
      setSettings({
        isDarkMode: saved.isDarkMode === true || saved.isDarkMode === 'true',
        language: saved.language || 'ar',
        currency: saved.currency || 'ل.س',
        repairCounter: parseInt(saved.repairCounter) || 0,
      });
    } catch {
      setSettings({ ...defaultSettings, isDarkMode: systemScheme === 'dark' });
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = useCallback(async () => {
    const newSettings = { ...settings, isDarkMode: !settings.isDarkMode };
    setSettings(newSettings);
    await api.settings.update({ isDarkMode: newSettings.isDarkMode });
  }, [settings]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await api.settings.update(updates);
  }, [settings]);

  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: settings.isDarkMode,
        toggleTheme,
        settings,
        updateSettings,
        isLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
