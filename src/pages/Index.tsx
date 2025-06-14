
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, History, FileText, User, ChevronRight, TrendingUp, Clock, BookOpen, Zap } from 'lucide-react';
import { CalculatorGrid } from '@/components/CalculatorGrid';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              <div className="text-center sm:text-left mb-6">
                <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Plataforma Profissional
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                  Calculadora de
                  <span className="text-blue-600 block sm:inline sm:ml-3">Arquitetura</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Ferramentas profissionais para cálculos arquitetônicos, estimativas de materiais e conversões. 
                  Desenvolvido com base em normas técnicas brasileiras.
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
            </div>
            
            {/* User Authentication Card */}
            {!user && (
              <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-900 text-xl">Maximize seu potencial</CardTitle>
                      <CardDescription className="text-blue-700 text-base">
                        Crie uma conta para salvar seus cálculos e acessar recursos exclusivos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <User className="mr-2 h-5 w-5" />
                    Criar conta gratuita
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* User Dashboard */}
            {user && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Olá, {user.email?.split('@')[0]}! 👋</h2>
                    <p className="text-gray-600">Continue de onde parou ou explore novas ferramentas</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Conta Ativa
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm" onClick={() => navigate('/history')}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <History className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900">Histórico de Cálculos</CardTitle>
                            <CardDescription className="text-sm">Acesse seus cálculos anteriores</CardDescription>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm" onClick={() => navigate('/settings')}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900">Configurações</CardTitle>
                            <CardDescription className="text-sm">Personalize sua experiência</CardDescription>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Calculator Grid */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Calculadoras Disponíveis</h2>
                <p className="text-gray-600">Escolha a ferramenta ideal para seu projeto</p>
              </div>
              <CalculatorGrid />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
