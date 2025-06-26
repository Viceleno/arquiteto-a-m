
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, FileText, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const HistoryPanel = () => {
  const [calculationCount, setCalculationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalculationCount = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { count, error } = await supabase
          .from('calculations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) throw error;

        setCalculationCount(count || 0);
      } catch (error) {
        console.error('Erro ao buscar contagem de cálculos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculationCount();
  }, [user]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Histórico de Cálculos</span>
        </CardTitle>
        <CardDescription>
          Seus cálculos são salvos automaticamente no banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : calculationCount}
              </div>
              <div className="text-sm text-gray-600">
                {calculationCount === 1 ? 'Cálculo salvo' : 'Cálculos salvos'}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/history')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Ver Histórico
          </Button>
        </div>

        {calculationCount === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-4 mt-4 border-t">
            <p className="text-sm">
              Seus cálculos aparecerão aqui automaticamente quando você usar nossas calculadoras
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
