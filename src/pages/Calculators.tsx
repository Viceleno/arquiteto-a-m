
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AreaCalculator } from '@/components/calculators/AreaCalculator';
import { MaterialCalculator } from '@/components/calculators/MaterialCalculator';
import { CostCalculator } from '@/components/calculators/CostCalculator';
import { Calculator, HardHat, DollarSign, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Calculators = () => {
  const { type } = useParams();

  const calculatorInfo = {
    area: {
      title: 'Cálculo de Área e Volume',
      description: 'Calcule áreas e volumes de diferentes formas geométricas com precisão profissional',
      icon: Calculator,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500'
    },
    materials: {
      title: 'Estimativa de Materiais',
      description: 'Dimensionamento preciso de materiais baseado em normas técnicas brasileiras',
      icon: HardHat,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500'
    },
    costs: {
      title: 'Estimativa de Custos',
      description: 'Orçamento detalhado com materiais, mão de obra e BDI profissional',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500'
    }
  };

  const getCalculatorComponent = () => {
    switch (type) {
      case 'area':
        return <AreaCalculator />;
      case 'materials':
        return <MaterialCalculator />;
      case 'costs':
        return <CostCalculator />;
      default:
        return null;
    }
  };

  const currentInfo = type ? calculatorInfo[type as keyof typeof calculatorInfo] : null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 w-full">
        <Header />
        <main className="container mx-auto py-4 sm:py-6 px-2 sm:px-4">
          {type && currentInfo ? (
            <div className="w-full space-y-6">
              {/* Calculator Header */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="mb-4 hover:bg-white/50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className={`bg-gradient-to-r ${currentInfo.color} text-white rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <currentInfo.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            {currentInfo.title}
                          </CardTitle>
                          <CardDescription className="text-white/90 text-base max-w-2xl">
                            {currentInfo.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Profissional
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Calculator Component */}
              <div className="animate-fade-in">
                {getCalculatorComponent()}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Page Header */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calculator className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                  Calculadoras Profissionais
                </h1>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Ferramentas especializadas para arquitetura e construção. 
                  Todas as calculadoras possuem a opção de salvar os resultados no seu histórico.
                </p>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Baseado em Normas Técnicas Brasileiras
                </Badge>
              </div>
              
              {/* Calculator Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {Object.entries(calculatorInfo).map(([key, info]) => (
                  <Card 
                    key={key}
                    className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                    onClick={() => window.location.href = `/calculators/${key}`}
                  >
                    <CardHeader className="pb-4">
                      <div className={`w-14 h-14 rounded-xl ${info.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <info.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {info.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed">
                        {info.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                        <span>Acessar calculadora</span>
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Features Section */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border-0 shadow-lg max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Por que escolher nossas calculadoras?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Baseado em Normas</h4>
                    <p className="text-sm text-gray-600">Seguem rigorosamente as normas técnicas brasileiras (ABNT)</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Precisão Profissional</h4>
                    <p className="text-sm text-gray-600">Cálculos validados por profissionais da construção civil</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interface Intuitiva</h4>
                    <p className="text-sm text-gray-600">Design focado na experiência do usuário e facilidade de uso</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Calculators;
