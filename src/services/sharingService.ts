import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from './analyticsService';

export interface ShareCalculationData {
  calculation_id: string;
  expires_at?: string;
}

export const createShareLink = async (data: ShareCalculationData) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    const { data: shareData, error } = await supabase
      .from('shared_calculations')
      .insert({
        calculation_id: data.calculation_id,
        user_id: userData.user.id,
        expires_at: data.expires_at || null,
      })
      .select('share_token')
      .single();

    if (error) throw error;

    // Track analytics event
    trackEvent('calculation_shared', {
      calculation_id: data.calculation_id,
    });

    const shareUrl = `${window.location.origin}/shared/${shareData.share_token}`;
    return { success: true, shareUrl, token: shareData.share_token };
  } catch (error: any) {
    console.error('Erro ao criar link de compartilhamento:', error);
    return { success: false, error: error.message };
  }
};

export const getSharedCalculation = async (token: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_shared_calculation', { token })
      .single();

    if (error) throw error;

    // Incrementar contador de visualizações
    await supabase.rpc('increment_share_view_count', { token });

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar cálculo compartilhado:', error);
    return { success: false, error: error.message };
  }
};

export const getUserSharedCalculations = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('shared_calculations')
      .select(`
        *,
        calculations (
          name,
          calculator_type,
          created_at
        )
      `)
      .eq('user_id', userData.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar compartilhamentos:', error);
    return { success: false, error: error.message };
  }
};

export const deactivateShareLink = async (shareId: string) => {
  try {
    const { error } = await supabase
      .from('shared_calculations')
      .update({ is_active: false })
      .eq('id', shareId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao desativar link:', error);
    return { success: false, error: error.message };
  }
};

export const useSharingService = () => {
  const { toast } = useToast();

  const shareCalculation = async (data: ShareCalculationData) => {
    const result = await createShareLink(data);
    
    if (result.success) {
      toast({
        title: 'Link criado com sucesso',
        description: 'Link de compartilhamento copiado para a área de transferência.',
      });
      
      // Copiar para clipboard
      if (result.shareUrl) {
        await navigator.clipboard.writeText(result.shareUrl);
      }
      
      return result;
    } else {
      toast({
        title: 'Erro ao criar link',
        description: result.error,
        variant: 'destructive',
      });
      return result;
    }
  };

  const deactivateShare = async (shareId: string) => {
    const result = await deactivateShareLink(shareId);
    
    if (result.success) {
      toast({
        title: 'Link desativado',
        description: 'O link de compartilhamento foi desativado com sucesso.',
      });
    } else {
      toast({
        title: 'Erro ao desativar link',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  };

  return { shareCalculation, deactivateShare };
};