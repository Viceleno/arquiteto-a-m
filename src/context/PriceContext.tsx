import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { materialsDatabase } from '@/components/calculators/cost/CostCalculatorTypes';
import { useToast } from '@/hooks/use-toast';

export interface PriceItem {
  materialKey: string;
  compositionIndex: number;
  compositionName: string;
  unit: string;
  unitPrice: number;
  defaultPrice: number;
}

interface PriceContextType {
  prices: Record<string, number>;
  priceItems: PriceItem[];
  loading: boolean;
  updatePrice: (materialKey: string, compositionIndex: number, newPrice: number) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refreshPrices: () => Promise<void>;
  getPriceKey: (materialKey: string, compositionIndex: number) => string;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export const usePrices = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
};

// Função auxiliar para gerar chave única de preço
const getPriceKey = (materialKey: string, compositionIndex: number): string => {
  return `${materialKey}_${compositionIndex}`;
};

// Gerar lista de todos os itens de preço a partir do materialsDatabase
const generateDefaultPriceItems = (): PriceItem[] => {
  const items: PriceItem[] = [];
  
  Object.entries(materialsDatabase).forEach(([materialKey, materialData]) => {
    materialData.compositions.forEach((composition, index) => {
      items.push({
        materialKey,
        compositionIndex: index,
        compositionName: composition.name,
        unit: composition.unit,
        unitPrice: composition.unitPrice,
        defaultPrice: composition.unitPrice,
      });
    });
  });
  
  return items;
};

// Gerar preços default como objeto Record
const generateDefaultPrices = (): Record<string, number> => {
  const prices: Record<string, number> = {};
  
  Object.entries(materialsDatabase).forEach(([materialKey, materialData]) => {
    materialData.compositions.forEach((composition, index) => {
      const key = getPriceKey(materialKey, index);
      prices[key] = composition.unitPrice;
    });
  });
  
  return prices;
};

interface PriceProviderProps {
  children: ReactNode;
}

export const PriceProvider: React.FC<PriceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prices, setPrices] = useState<Record<string, number>>(generateDefaultPrices());
  const [priceItems, setPriceItems] = useState<PriceItem[]>(generateDefaultPriceItems());
  const [loading, setLoading] = useState(true);

  // Carregar preços do Supabase
  const loadPrices = useCallback(async () => {
    setLoading(true);
    
    try {
      // Começar com preços default
      const defaultPrices = generateDefaultPrices();
      const defaultItems = generateDefaultPriceItems();
      
      if (user) {
        // Buscar preços customizados do usuário
        const { data, error } = await supabase
          .from('material_prices')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Erro ao carregar preços:', error);
        } else if (data && data.length > 0) {
          // Sobrescrever preços com valores do banco
          data.forEach((row) => {
            const key = getPriceKey(row.material_key, row.composition_index);
            defaultPrices[key] = Number(row.unit_price);
            
            // Atualizar item correspondente
            const itemIndex = defaultItems.findIndex(
              item => item.materialKey === row.material_key && item.compositionIndex === row.composition_index
            );
            if (itemIndex >= 0) {
              defaultItems[itemIndex].unitPrice = Number(row.unit_price);
            }
          });
        }
      }
      
      setPrices(defaultPrices);
      setPriceItems(defaultItems);
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Atualizar um preço específico
  const updatePrice = useCallback(async (
    materialKey: string, 
    compositionIndex: number, 
    newPrice: number
  ) => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para salvar preços personalizados',
        variant: 'destructive',
      });
      return;
    }

    const key = getPriceKey(materialKey, compositionIndex);
    const item = priceItems.find(
      p => p.materialKey === materialKey && p.compositionIndex === compositionIndex
    );

    if (!item) return;

    try {
      // Upsert no banco
      const { error } = await supabase
        .from('material_prices')
        .upsert({
          material_key: materialKey,
          composition_index: compositionIndex,
          composition_name: item.compositionName,
          unit: item.unit,
          unit_price: newPrice,
          user_id: user.id,
        }, {
          onConflict: 'material_key,composition_index,user_id'
        });

      if (error) throw error;

      // Atualizar estado local
      setPrices(prev => ({ ...prev, [key]: newPrice }));
      setPriceItems(prev => prev.map(p => 
        p.materialKey === materialKey && p.compositionIndex === compositionIndex
          ? { ...p, unitPrice: newPrice }
          : p
      ));

      toast({
        title: 'Preço atualizado',
        description: `${item.compositionName}: R$ ${newPrice.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o preço',
        variant: 'destructive',
      });
    }
  }, [user, priceItems, toast]);

  // Resetar para preços default
  const resetToDefaults = useCallback(async () => {
    if (!user) return;

    try {
      // Deletar todos os preços customizados do usuário
      const { error } = await supabase
        .from('material_prices')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Resetar estado local
      setPrices(generateDefaultPrices());
      setPriceItems(generateDefaultPriceItems());

      toast({
        title: 'Preços resetados',
        description: 'Todos os preços voltaram aos valores padrão',
      });
    } catch (error) {
      console.error('Erro ao resetar preços:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar os preços',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Carregar preços ao inicializar ou quando usuário mudar
  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const value: PriceContextType = {
    prices,
    priceItems,
    loading,
    updatePrice,
    resetToDefaults,
    refreshPrices: loadPrices,
    getPriceKey,
  };

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  );
};
