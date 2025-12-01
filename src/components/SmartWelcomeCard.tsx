import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Clock, 
  TrendingUp, 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Target,
  Zap,
  BookOpen,
  Lightbulb,
  History
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getCalculatorByDbKey } from '@/config/calculatorRegistry';

interface UserStats {
  totalCalculations: number;
  lastCalculationDate: string | null;
  favoriteCalculator: string | null;
}

interface RecentCalculation {
  id: string;
  name: string | null;
  calculator_type: string;
  created_at: string;
  result: any;
}

export const SmartWelcomeCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    totalCalculations: 0,
    lastCalculationDate: null,
    favoriteCalculator: null
  });
  const [recentCalculations, setRecentCalculations] = useState<RecentCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Carregar dados reais do usuário
  useEffect(() => {
    if (user) {
      loadUserStats();
      loadRecentCalculations();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Buscar total de cálculos
      const { count, error: countError } = await supabase
        .from('calculations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      // Buscar calculadora mais usada
      const { data: calcTypes, error: typesError } = await supabase
        .from('calculations')
        .select('calculator_type')
        .eq('user_id', user.id);

      if (typesError) throw typesError;

      // Contar tipos de calculadora
      const typeCounts = calcTypes?.reduce((acc: Record<string, number>, calc) => {
        acc[calc.calculator_type] = (acc[calc.calculator_type] || 0) + 1;
        return acc;
      }, {});

      const favoriteType = typeCounts && Object.keys(typeCounts).length > 0
        ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

      // Buscar última data de cálculo
      const { data: lastCalc, error: lastError } = await supabase
        .from('calculations')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) throw lastError;

      setUserStats({
        totalCalculations: count || 0,
        lastCalculationDate: lastCalc?.created_at || null,
        favoriteCalculator: favoriteType
      });

      // Verificar se é primeira visita
      const isFirstVisit = !localStorage.getItem('arqcalc_onboarding_completed');
      setShowOnboarding(isFirstVisit && (count === 0 || count === null));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentCalculations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('id, name, calculator_type, created_at, result')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentCalculations(data || []);
    } catch (error) {
      console.error('Erro ao carregar cálculos recentes:', error);
    }
  };

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getMotivationalMessage = () => {
    if (userStats.totalCalculations === 0) {
      return "Vamos começar seu primeiro cálculo!";
    } else if (userStats.totalCalculations < 5) {
      return "Você está no caminho certo!";
    } else if (userStats.totalCalculations < 20) {
      return "Excelente progresso!";
    } else {
      return "Você é um expert em cálculos!";
    }
  };

  const getFavoriteCalculatorName = () => {
    if (!userStats.favoriteCalculator) return 'Nenhuma ainda';
    const calculator = getCalculatorByDbKey(userStats.favoriteCalculator);
    return calculator?.title || userStats.favoriteCalculator;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultPreview = (calc: RecentCalculation): string => {
    const result = calc.result || {};
    if (result.totalCostWithBDI) {
      return `R$ ${parseFloat(result.totalCostWithBDI).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (result.totalCost) {
      return `R$ ${parseFloat(result.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (result.area) {
      return `${parseFloat(result.area).toFixed(2)} m²`;
    }
    if (result.volume) {
      return `${parseFloat(result.volume).toFixed(2)} m³`;
    }
    return 'Ver detalhes';
  };

  const onboardingSteps = [
    {
      title: "Bem-vindo ao ArqCalc!",
      description: "Sua plataforma profissional para cálculos arquitetônicos",
      icon: Sparkles,
      completed: true,
      action: () => {}
    },
    {
      title: "Explore as Calculadoras",
      description: "Descubra todas as ferramentas disponíveis",
      icon: Calculator,
      completed: false,
      action: () => navigate('/calculators')
    },
    {
      title: "Faça seu Primeiro Cálculo",
      description: "Experimente uma das calculadoras",
      icon: Target,
      completed: false,
      action: () => navigate('/calculators/area')
    },
    {
      title: "Salve no Histórico",
      description: "Todos os cálculos são salvos automaticamente",
      icon: CheckCircle,
      completed: false,
      action: () => navigate('/history')
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Card Principal */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900">
                  {getUserGreeting()}, {user?.email?.split('@')[0]}! 👋
                </CardTitle>
                <CardDescription className="text-blue-700 text-lg">
                  {getMotivationalMessage()}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                Conta Ativa
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                {userStats.totalCalculations} cálculos
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {isLoading ? '...' : userStats.totalCalculations}
              </div>
              <div className="text-sm text-blue-700">Cálculos Realizados</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {isLoading ? '...' : (userStats.lastCalculationDate ? formatDate(userStats.lastCalculationDate).split(',')[0] : 'Nenhum')}
              </div>
              <div className="text-sm text-green-700">Último Cálculo</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1 truncate">
                {isLoading ? '...' : getFavoriteCalculatorName()}
              </div>
              <div className="text-sm text-purple-700">Mais Usada</div>
            </div>
          </div>

          {/* Recent Calculations */}
          {recentCalculations.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Recentes</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/history')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {recentCalculations.map((calc) => {
                  const calculator = getCalculatorByDbKey(calc.calculator_type);
                  return (
                    <div
                      key={calc.id}
                      onClick={() => navigate(`/history`)}
                      className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {calculator?.icon && (
                          <div className={`w-8 h-8 ${calculator.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <calculator.icon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {calc.name || calculator?.title || 'Sem nome'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(calc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700 ml-2 flex-shrink-0">
                        {getResultPreview(calc)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
              onClick={() => navigate('/calculators')}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Nova Calculadora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate('/history')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Ver Histórico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Card */}
      {showOnboarding && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-orange-900">
                    Tour Rápido do ArqCalc
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Aprenda a usar todas as funcionalidades em poucos passos
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowOnboarding(false);
                  localStorage.setItem('arqcalc_onboarding_completed', 'true');
                }}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Pular Tour
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-700">Progresso do Tour</span>
                <span className="text-orange-600 font-medium">{completedSteps}/{onboardingSteps.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onboardingSteps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    step.completed 
                      ? 'bg-green-100 border border-green-200' 
                      : 'bg-white/60 border border-orange-200 cursor-pointer hover:bg-orange-50'
                  }`}
                  onClick={!step.completed ? step.action : undefined}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    step.completed ? 'bg-green-500' : 'bg-orange-100'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <step.icon className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${
                      step.completed ? 'text-green-900' : 'text-orange-900'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs ${
                      step.completed ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                  {!step.completed && (
                    <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white"
                onClick={() => navigate('/calculators')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continuar Tour
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowOnboarding(false);
                  localStorage.setItem('arqcalc_onboarding_completed', 'true');
                }}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Começar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
