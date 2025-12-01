import React, { useEffect, useState } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { SmartWelcomeCard } from '@/components/SmartWelcomeCard';
import { EnhancedCalculatorGrid } from '@/components/EnhancedCalculatorGrid';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useMobile } from '@/hooks/useMobile';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { trackEvent } from '@/services/analyticsService';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { calculatorRegistry, getCalculatorByDbKey } from '@/config/calculatorRegistry';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [showAllCalculators, setShowAllCalculators] = useState(false);
  const [topCalculators, setTopCalculators] = useState(calculatorRegistry.slice(0, 3));

  useEffect(() => {
    trackEvent('page_view', { page: 'dashboard' });
    if (user) {
      loadTopCalculators();
    }
  }, [user]);

  const loadTopCalculators = async () => {
    if (!user) return;

    try {
      // Buscar os tipos de calculadora mais usados pelo usuário
      const { data, error } = await supabase
        .from('calculations')
        .select('calculator_type')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Contar tipos de calculadora
        const typeCounts = data.reduce((acc: Record<string, number>, calc) => {
          acc[calc.calculator_type] = (acc[calc.calculator_type] || 0) + 1;
          return acc;
        }, {});

        // Ordenar por mais usados
        const sortedTypes = Object.entries(typeCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type]) => type);

        // Mapear para configurações de calculadora
        const topCalcs = sortedTypes
          .map(type => getCalculatorByDbKey(type))
          .filter(calc => calc !== undefined);

        if (topCalcs.length > 0) {
          setTopCalculators(topCalcs as typeof calculatorRegistry);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar calculadoras principais:', error);
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <DashboardSkeleton />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Welcome Card com dados reais */}
        <SmartWelcomeCard />

        {/* Acesso Rápido - Calculadoras Principais */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">Acesso Rápido</CardTitle>
              <Button
                onClick={() => navigate('/calculators')}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCalculators.map((calculator) => (
                <Card
                  key={calculator.id}
                  className="border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                  onClick={() => navigate(calculator.route)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-16 h-16 ${calculator.color} rounded-2xl flex items-center justify-center`}>
                        <calculator.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{calculator.title}</h3>
                        <p className="text-sm text-gray-600">{calculator.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Botão FAB - Novo Projeto */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/calculators')}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Cálculo
          </Button>
        </div>

        {/* Calculators Grid Completo - Colapsável */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader 
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-colors"
            onClick={() => setShowAllCalculators(!showAllCalculators)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">
                Todas as Calculadoras
              </CardTitle>
              <Button variant="ghost" size="sm">
                {showAllCalculators ? (
                  <>
                    <ChevronUp className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showAllCalculators && (
            <CardContent className="p-4 lg:p-6">
              <EnhancedCalculatorGrid />
            </CardContent>
          )}
        </Card>

        {/* Mobile History Panel */}
        {isMobile && (
          <div className="mt-8">
            <HistoryPanel />
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default Index;
