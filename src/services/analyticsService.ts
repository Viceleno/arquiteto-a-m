import { supabase } from '@/integrations/supabase/client';

/**
 * Rastreia um evento de análise.
 * @param eventName O nome do evento (ex: 'calculation_completed').
 * @param eventData Dados JSON adicionais sobre o evento (opcional).
 */
export const trackEvent = async (eventName: string, eventData: Record<string, any> = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const payload = {
      user_id: session?.user.id || null,
      event_name: eventName,
      event_data: eventData,
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
    };

    // Fire-and-forget para não bloquear a UI
    supabase
      .from('analytics_events')
      .insert(payload)
      .then(({ error }) => {
        if (error) {
          console.warn('Erro ao rastrear evento:', error.message);
        }
      });

  } catch (error) {
    console.warn('Erro ao rastrear evento:', error);
  }
};
