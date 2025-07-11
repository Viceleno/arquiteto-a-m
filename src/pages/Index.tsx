import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, History, User, TrendingUp, Clock, BookOpen, Zap } from 'lucide-react';
import { CalculatorGrid } from '@/components/CalculatorGrid';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { HistoryPanel } from '@/components/HistoryPanel';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show skeleton while auth is loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  const quickStats = [
    { 
      icon: Calculator, 
      label: 'Calculadoras', 
      value: '8+', 
      description: 'Ferramentas disponíveis',
      color: 'bg-blue-500'
    },
    { 
      icon: TrendingUp, 
      label: 'Precisão', 
      value: '99.9%', 
      description: 'Baseado em normas técnicas',
      color: 'bg-green-500'
    },
    { 
      icon: Zap, 
      label: 'Velocidade', 
      value: '<1s', 
      description: 'Cálculos instantâneos',
      color: 'bg-orange-500'
    }
  ];

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center lg:text-left mb-6">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            <BookOpen className="w-3 h-3 mr-1" />
            Plataforma Profissional
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
            Bem-vindo ao
            <span className="text-blue-600 block sm:inline sm:ml-3">ArqCalc</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
            Suas ferramentas profissionais para cálculos arquitetônicos estão prontas para uso. 
            Desenvolvido com base em normas técnicas brasileiras para resultados precisos.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Welcome Message */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-green-900 text-xl">
                      Olá, {user?.email?.split('@')[0]}! 👋
                    </CardTitle>
                    <CardDescription className="text-green-700 text-base">
                      Seus cálculos são salvos automaticamente. Escolha uma calculadora abaixo para começar.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 self-start sm:self-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Conta Ativa
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
        
        {/* Calculator Grid - Main Focus */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Calculadoras Disponíveis</h2>
            <p className="text-gray-600">Escolha a ferramenta ideal para seu projeto</p>
          </div>
          <CalculatorGrid />
        </div>

        {/* History Panel for Mobile */}
        <div className="lg:hidden">
          <HistoryPanel />
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Index;
