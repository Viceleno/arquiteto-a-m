
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  // Novos campos de configuração empresarial
  cau_crea?: string | null;
  professional_phone?: string | null;
  business_address?: string | null;
  default_bdi?: number;
  social_charges?: number;
  tech_hour_rate?: number;
}

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  resetToMarketDefaults: () => Promise<void>;
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
  // Valores padrão para novos campos
  cau_crea: null,
  professional_phone: null,
  business_address: null,
  default_bdi: 20,
  social_charges: 88,
  tech_hour_rate: 150,
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
        // Safe type casting com validação
        const theme = ['light', 'dark', 'system'].includes(data.theme) 
          ? (data.theme as 'light' | 'dark' | 'system') 
          : defaultSettings.theme;
        
        // Merge com defaults para garantir valores válidos mesmo se campos forem null
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
          // Novos campos com merge inteligente de defaults
          cau_crea: data.cau_crea ?? defaultSettings.cau_crea,
          professional_phone: data.professional_phone ?? defaultSettings.professional_phone,
          business_address: data.business_address ?? defaultSettings.business_address,
          default_bdi: data.default_bdi ?? defaultSettings.default_bdi,
          social_charges: data.social_charges ?? defaultSettings.social_charges,
          tech_hour_rate: data.tech_hour_rate ?? defaultSettings.tech_hour_rate,
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
    const previousSettings = settings;
    setSettings(updatedSettings);

    try {
      // Preparar dados para upsert, removendo undefined
      const updateData: any = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Adicionar apenas campos definidos
      Object.keys(newSettings).forEach((key) => {
        const value = newSettings[key as keyof UserSettings];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      const { error } = await supabase
        .from('user_settings')
        .upsert(updateData);

      if (error) throw error;

      // Apply theme changes immediately if theme was updated
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }

      // Fornecer feedback visual específico por seção
      const updatedFields = Object.keys(newSettings);
      
      // Detectar qual seção foi atualizada para feedback contextualizado
      if (updatedFields.some(f => ['theme', 'email_notifications'].includes(f))) {
        // Feedback mínimo para mudanças rápidas de UI
        if (updatedFields.length === 1) {
          return; // Sem toast para mudanças isoladas muito rápidas
        }
      }

      // Toast de sucesso geral apenas se múltiplos campos
      if (updatedFields.length > 1) {
        console.log('✅ Configurações atualizadas:', updatedFields);
      }
    } catch (error: any) {
      // Revert on error
      setSettings(previousSettings);
      
      // Tratamento de erro robusto com mensagem específica
      const errorMessage = error?.message || 'Erro desconhecido ao atualizar configurações';
      console.error('Error updating settings:', error);
      
      throw new Error(errorMessage);
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

  const resetToMarketDefaults = async () => {
    // Resetar apenas parâmetros de engenharia para padrões de mercado
    const marketDefaults: Partial<UserSettings> = {
      bdi_padrao: 20,
      encargos_sociais: 88,
      valor_hora_tecnica: 150,
      perda_padrao_materiais: 5,
      default_bdi: 20,
      social_charges: 88,
      tech_hour_rate: 150,
    };

    try {
      await updateSettings(marketDefaults);
      console.log('✅ Parâmetros resetados para padrões de mercado');
    } catch (error) {
      console.error('Erro ao resetar para padrões de mercado:', error);
      throw error;
    }
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
      resetToMarketDefaults,
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
