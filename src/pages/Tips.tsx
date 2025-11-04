import React from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Lightbulb, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2,
  Ruler,
  HardHat,
  DollarSign,
  BookOpen,
  Zap,
  Target,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Tips = () => {
  const navigate = useNavigate();

  const calculatorGuides = [
    {
      icon: Ruler,
      title: 'Cálculo de Área e Volume',
      description: 'Calcule com precisão áreas e volumes de diferentes formas geométricas',
      tips: [
        'Sempre meça em metros para maior precisão',
        'Para formas irregulares, divida em formas geométricas simples',
        'Use a calculadora de perímetro para estimar cercamentos',
        'Adicione 5-10% de margem para desperdícios'
      ],
      route: '/calculators/area'
    },
    {
      icon: HardHat,
      title: 'Estimativa de Materiais',
      description: 'Calcule quantidades precisas de materiais para sua obra',
      tips: [
        'Sempre adicione margem de segurança (10-15% recomendado)',
        'Considere o formato e tamanho dos materiais disponíveis',
        'Verifique as especificações técnicas antes de comprar',
        'Para pisos e revestimentos, considere juntas e recortes'
      ],
      route: '/calculators/materials'
    },
    {
      icon: DollarSign,
      title: 'Estimativa de Custos',
      description: 'Orçamento detalhado com preços atualizados do mercado',
      tips: [
        'Atualize os preços regionais regularmente',
        'Inclua custos indiretos (transporte, mão de obra)',
        'Compare preços entre diferentes fornecedores',
        'Mantenha 10-20% de reserva para imprevistos'
      ],
      route: '/calculators/costs'
    }
  ];

  const bestPractices = [
    {
      icon: Target,
      title: 'Precisão nas Medidas',
      description: 'Use ferramentas de medição profissionais e confira múltiplas vezes'
    },
    {
      icon: CheckCircle2,
      title: 'Documentação',
      description: 'Salve todos os cálculos no histórico para referência futura'
    },
    {
      icon: Zap,
      title: 'Compartilhamento',
      description: 'Exporte ou compartilhe cálculos com sua equipe via PDF ou link'
    },
    {
      icon: BookOpen,
      title: 'Normas Técnicas',
      description: 'Nossos cálculos seguem normas ABNT e padrões da construção civil'
    }
  ];

  const commonMistakes = [
    {
      title: 'Não adicionar margem de segurança',
      solution: 'Sempre inclua 10-15% extra para cobrir desperdícios e imprevistos'
    },
    {
      title: 'Ignorar características do terreno',
      solution: 'Considere desníveis, irregularidades e condições locais'
    },
    {
      title: 'Misturar unidades de medida',
      solution: 'Use sempre a mesma unidade (metros) em todos os campos'
    },
    {
      title: 'Não verificar compatibilidade de materiais',
      solution: 'Confirme especificações técnicas antes de calcular quantidades'
    }
  ];

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Dicas de Uso</h1>
              <p className="text-muted-foreground">Aproveite ao máximo as calculadoras do ArqCalc</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Target className="w-3 h-3" />
              Guias Práticos
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              Melhores Práticas
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              Evite Erros Comuns
            </Badge>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Início Rápido
            </CardTitle>
            <CardDescription>
              Comece a usar o ArqCalc em 3 passos simples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-semibold">Escolha a Calculadora</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-10">
                  Selecione a calculadora adequada para seu projeto
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-semibold">Insira as Medidas</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-10">
                  Preencha os campos com medidas precisas em metros
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="font-semibold">Salve e Compartilhe</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-10">
                  Exporte em PDF ou compartilhe com sua equipe
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculator Guides */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Guias por Calculadora</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {calculatorGuides.map((guide, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <guide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {guide.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(guide.route)}
                  >
                    Usar Calculadora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Best Practices */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Melhores Práticas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestPractices.map((practice, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <practice.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{practice.title}</h3>
                    <p className="text-sm text-muted-foreground">{practice.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Common Mistakes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Evite Erros Comuns</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {commonMistakes.map((mistake, index) => (
                  <div key={index} className="flex gap-4">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold text-foreground">{mistake.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-green-700 dark:text-green-400">Solução:</span> {mistake.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Pronto para começar?</h3>
            <p className="mb-6 text-blue-50">
              Coloque essas dicas em prática e faça seus cálculos com confiança
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => navigate('/calculators')}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Ir para Calculadoras
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/history')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Ver Histórico
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default Tips;
