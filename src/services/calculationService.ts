
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from './analyticsService';

export interface CalculationData {
  calculator_type: string;
  input_data: Record<string, any>;
  result: Record<string, any>;
  name?: string;
}

export const saveCalculation = async (data: CalculationData) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('calculations')
      .insert({
        user_id: userData.user.id,
        calculator_type: data.calculator_type,
        input_data: data.input_data,
        result: data.result,
        name: data.name,
      });

    if (error) throw error;

    // Track analytics event
    trackEvent('calculation_saved', {
      calculator_type: data.calculator_type,
    });

    return true;
  } catch (error) {
    console.error('Erro ao salvar cálculo:', error);
    return false;
  }
};

export const useCalculationService = () => {
  const { toast } = useToast();

  const saveCalculationWithToast = async (data: CalculationData) => {
    try {
      const success = await saveCalculation(data);
      
      if (success) {
        toast({
          title: 'Cálculo salvo',
          description: 'Seu cálculo foi salvo com sucesso no banco de dados.',
        });
        return true;
      } else {
        throw new Error('Falha ao salvar cálculo');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cálculo',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return { saveCalculation: saveCalculationWithToast };
};
