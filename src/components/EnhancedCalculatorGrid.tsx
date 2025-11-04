import React from 'react';
import { CalculatorCard } from '@/components/CalculatorCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  HardHat,
  Ruler,
  DollarSign,
  Clock,
  Users,
  Star,
  ArrowRight,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

const calculators = [
  {
    id: 'area',
    title: 'Cálculo de Área e Volume',
    description: 'Calcule áreas e volumes de diferentes formas geométricas',
    icon: Ruler,
    color: 'bg-blue-500',
    category: 'Medidas e Cálculos',
    difficulty: 'Fácil',
    timeEstimate: '2-5 min',
    example: 'Quarto 4x3m = 12m²',
    popularity: 95,
    features: ['Retângulo', 'Círculo', 'Triângulo', 'Volume 3D'],
    useCase: 'Ideal para dimensionamento de ambientes e cálculo de materiais'
  },
  {
    id: 'materials',
    title: 'Estimativa de Materiais',
    description: 'Concreto, tijolos, argamassa, iluminação, telhado e mais',
    icon: HardHat,
    color: 'bg-orange-500',
    category: 'Materiais',
    difficulty: 'Médio',
    timeEstimate: '5-10 min',
    example: 'Casa 100m² = 15m³ concreto',
    popularity: 88,
    features: ['Concreto', 'Tijolos', 'Argamassa', 'Iluminação'],
    useCase: 'Perfeito para orçamentos e compras de materiais'
  },
  {
    id: 'costs',
    title: 'Estimativa de Custos',
    description: 'Orçamento detalhado com campos específicos por material',
    icon: DollarSign,
    color: 'bg-emerald-500',
    category: 'Orçamento',
    difficulty: 'Avançado',
    timeEstimate: '10-15 min',
    example: 'Projeto completo = R$ 50.000',
    popularity: 92,
    features: ['BDI', 'Mão de Obra', 'Materiais', 'Complexidade'],
    useCase: 'Essencial para propostas comerciais e controle de custos'
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Fácil': return 'bg-green-100 text-green-700 border-green-200';
    case 'Médio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Avançado': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getTimeColor = (time: string) => {
  if (time.includes('2-5')) return 'text-green-600';
  if (time.includes('5-10')) return 'text-yellow-600';
  if (time.includes('10-15')) return 'text-red-600';
  return 'text-gray-600';
};

export const EnhancedCalculatorGrid = () => {
  const categories = [...new Set(calculators.map(calc => calc.category))];

  return (
    <div className="space-y-8">
      {/* Header com Contexto */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Calculadoras Profissionais</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Escolha a ferramenta ideal para seu projeto. Todas as calculadoras incluem exemplos práticos, 
          explicações técnicas e salvam automaticamente no seu histórico.
        </p>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>500+ profissionais</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4" />
            <span>Cálculos instantâneos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Baseado em normas ABNT</span>
          </div>
        </div>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {calculators.filter(calc => calc.category === category).length} calculadoras
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {calculators
              .filter(calc => calc.category === category)
              .map(calculator => (
                <Card 
                  key={calculator.id}
                  className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border-0 shadow-lg bg-white/90 backdrop-blur-sm"
                  onClick={() => window.location.href = `/calculators/${calculator.id}`}
                >
                  <CardHeader className="pb-4">
                    {/* Header com ícone e badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl ${calculator.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <calculator.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getDifficultyColor(calculator.difficulty)}>
                          {calculator.difficulty}
                        </Badge>
                        <div className={`text-xs font-medium ${getTimeColor(calculator.timeEstimate)}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {calculator.timeEstimate}
                        </div>
                      </div>
                    </div>

                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {calculator.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed mb-3">
                      {calculator.description}
                    </CardDescription>

                    {/* Exemplo prático */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Exemplo:</span>
                      </div>
                      <p className="text-sm text-blue-800 font-mono">{calculator.example}</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    {/* Features */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">INCLUI:</div>
                      <div className="flex flex-wrap gap-1">
                        {calculator.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Use Case */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">IDEAL PARA:</span>
                      </div>
                      <p className="text-xs text-gray-600">{calculator.useCase}</p>
                    </div>

                    {/* Popularity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {calculator.popularity}% aprovação
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                        <span>Acessar</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              Pronto para começar?
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Escolha uma calculadora acima e experimente a precisão profissional do ArqCalc.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
                onClick={() => window.location.href = '/calculators'}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Ver Todas as Calculadoras
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => window.location.href = '/tips'}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Dicas de Uso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
