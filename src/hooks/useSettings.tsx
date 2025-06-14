
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US' | 'es';
  unit_preference: 'metric' | 'imperial';
  default_margin: number;
  auto_save_calculations: boolean;
  decimal_places: number;
  email_notifications: boolean;
  push_notifications: boolean;
  calculation_reminders: boolean;
  share_calculations: boolean;
  data_analytics: boolean;
}

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'pt-BR',
  unit_preference: 'metric',
  default_margin: 10,
  auto_save_calculations: true,
  decimal_places: 2,
  email_notifications: true,
  push_notifications: false,
  calculation_reminders: true,
  share_calculations: false,
  data_analytics: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Safe type casting with validation
        const theme = ['light', 'dark', 'system'].includes(data.theme) ? data.theme as 'light' | 'dark' | 'system' : defaultSettings.theme;
        const language = ['pt-BR', 'en-US', 'es'].includes(data.language) ? data.language as 'pt-BR' | 'en-US' | 'es' : defaultSettings.language;
        const unit_preference = ['metric', 'imperial'].includes(data.unit_preference) ? data.unit_preference as 'metric' | 'imperial' : defaultSettings.unit_preference;
        
        setSettings({
          theme,
          language,
          unit_preference,
          default_margin: data.default_margin ?? defaultSettings.default_margin,
          auto_save_calculations: data.auto_save_calculations ?? defaultSettings.auto_save_calculations,
          decimal_places: data.decimal_places ?? defaultSettings.decimal_places,
          email_notifications: data.email_notifications ?? defaultSettings.email_notifications,
          push_notifications: data.push_notifications ?? defaultSettings.push_notifications,
          calculation_reminders: data.calculation_reminders ?? defaultSettings.calculation_reminders,
          share_calculations: data.share_calculations ?? defaultSettings.share_calculations,
          data_analytics: data.data_analytics ?? defaultSettings.data_analytics,
        });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Apply theme changes immediately
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert on error
      setSettings(settings);
      throw error;
    }
  };

  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  useEffect(() => {
    // Apply theme on settings change
    applyTheme(settings.theme);
  }, [settings.theme]);

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSettings,
      refreshSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
