
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  default_margin: number;
  auto_save_calculations: boolean;
  decimal_places: number;
  bdi_padrao: number;
  encargos_sociais: number;
  valor_hora_tecnica: number;
  perda_padrao_materiais: number;
}

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: 'light',
  email_notifications: true,
  default_margin: 10,
  auto_save_calculations: true,
  decimal_places: 2,
  bdi_padrao: 20,
  encargos_sociais: 88,
  valor_hora_tecnica: 150,
  perda_padrao_materiais: 5,
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
        
        setSettings({
          theme,
          email_notifications: data.email_notifications ?? defaultSettings.email_notifications,
          default_margin: data.default_margin ?? defaultSettings.default_margin,
          auto_save_calculations: data.auto_save_calculations ?? defaultSettings.auto_save_calculations,
          decimal_places: data.decimal_places ?? defaultSettings.decimal_places,
          bdi_padrao: data.bdi_padrao ?? defaultSettings.bdi_padrao,
          encargos_sociais: data.encargos_sociais ?? defaultSettings.encargos_sociais,
          valor_hora_tecnica: data.valor_hora_tecnica ?? defaultSettings.valor_hora_tecnica,
          perda_padrao_materiais: data.perda_padrao_materiais ?? defaultSettings.perda_padrao_materiais,
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
