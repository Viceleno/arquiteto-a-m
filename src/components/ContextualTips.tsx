import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  X, 
  ArrowRight, 
  BookOpen, 
  Calculator, 
  Target,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';

interface ContextualTip {
  id: string;
  title: string;
  description: string;
  category: 'tip' | 'example' | 'warning' | 'info';
  icon: React.ComponentType<any>;
  action?: {
    text: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

const tipsDatabase: Record<string, ContextualTip[]> = {
  'area': [
    {
      id: 'area-tip-1',
      title: 'Dica de Precisão',
      description: 'Para cálculos mais precisos, use sempre medidas em metros com pelo menos 2 casas decimais.',
      category: 'tip',
      icon: Target,
      dismissible: true
    },
    {
      id: 'area-tip-2',
      title: 'Exemplo Prático',
      description: 'Um quarto de 4m x 3m = 12m². Para volume, multiplique pela altura: 12m² x 2,5m = 30m³.',
      category: 'example',
      icon: Calculator,
      dismissible: true
    },
    {
      id: 'area-tip-3',
      title: 'Norma Técnica',
      description: 'Os cálculos seguem a NBR 12721 (ABNT) para medição de áreas em edificações.',
      category: 'info',
      icon: BookOpen,
      dismissible: true
    }
  ],
  'materials': [
    {
      id: 'materials-tip-1',
      title: 'Economia de Material',
      description: 'Sempre adicione 10% de margem de segurança para perdas e desperdícios.',
      category: 'warning',
      icon: Info,
      dismissible: true
    },
    {
      id: 'materials-tip-2',
      title: 'Exemplo de Concreto',
      description: 'Para uma laje de 100m² com 10cm de espessura: 100m² × 0,10m = 10m³ de concreto.',
      category: 'example',
      icon: Calculator,
      dismissible: true
    }
  ],
  'costs': [
    {
      id: 'costs-tip-1',
      title: 'BDI Padrão',
      description: 'O BDI de 20% é recomendado pelo SINAPI para obras públicas. Para obras privadas, pode variar de 15% a 30%.',
      category: 'info',
      icon: BookOpen,
      dismissible: true
    },
    {
      id: 'costs-tip-2',
      title: 'Complexidade Importante',
      description: 'A complexidade afeta diretamente o tempo de execução. Uma obra complexa pode levar 80% mais tempo.',
      category: 'warning',
      icon: Info,
      dismissible: true
    }
  ]
};

const getCategoryConfig = (category: string) => {
  switch (category) {
    case 'tip':
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
      };
    case 'example':
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100'
      };
    case 'warning':
      return {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-900',
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-100'
      };
    case 'info':
      return {
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-900',
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100'
      };
    default:
      return {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-900',
        iconColor: 'text-gray-600',
        iconBg: 'bg-gray-100'
      };
  }
};

interface ContextualTipsProps {
  calculatorType: string;
  onTipAction?: (tipId: string, action: string) => void;
}

export const ContextualTips: React.FC<ContextualTipsProps> = ({ 
  calculatorType, 
  onTipAction 
}) => {
  const [tips, setTips] = useState<ContextualTip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  const [showAllTips, setShowAllTips] = useState(false);

  useEffect(() => {
    const calculatorTips = tipsDatabase[calculatorType] || [];
    const dismissed = JSON.parse(localStorage.getItem('dismissed_tips') || '[]');
    setDismissedTips(new Set(dismissed));
    
    const visibleTips = calculatorTips.filter(tip => 
      !dismissed.includes(tip.id) || showAllTips
    );
    
    setTips(visibleTips);
  }, [calculatorType, showAllTips]);

  const dismissTip = (tipId: string) => {
    const newDismissed = [...dismissedTips, tipId];
    setDismissedTips(new Set(newDismissed));
    localStorage.setItem('dismissed_tips', JSON.stringify(newDismissed));
    
    setTips(prev => prev.filter(tip => tip.id !== tipId));
    
    if (onTipAction) {
      onTipAction(tipId, 'dismissed');
    }
  };

  const handleTipAction = (tip: ContextualTip) => {
    if (tip.action) {
      tip.action.onClick();
    }
    
    if (onTipAction) {
      onTipAction(tip.id, 'action');
    }
  };

  if (tips.length === 0) {
    return null;
  }

  const visibleTips = showAllTips ? tips : tips.slice(0, 2);
  const hasMoreTips = tips.length > 2;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Dicas Contextuais</h3>
        </div>
        {hasMoreTips && !showAllTips && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTips(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            Ver todas ({tips.length})
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Tips */}
      <div className="space-y-3">
        {visibleTips.map((tip) => {
          const config = getCategoryConfig(tip.category);
          return (
            <Card 
              key={tip.id} 
              className={`${config.bgColor} ${config.borderColor} border transition-all duration-200 hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <tip.icon className={`w-4 h-4 ${config.iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${config.textColor} mb-1`}>
                          {tip.title}
                        </h4>
                        <p className={`text-sm ${config.textColor} opacity-90`}>
                          {tip.description}
                        </p>
                      </div>
                      
                      {tip.dismissible && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissTip(tip.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    {tip.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTipAction(tip)}
                        className={`mt-3 ${config.borderColor} ${config.textColor} hover:${config.bgColor}`}
                      >
                        {tip.action.text}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          <BookOpen className="w-4 h-4 mr-1" />
          Ver Normas Técnicas
        </Button>
        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
          <Calculator className="w-4 h-4 mr-1" />
          Exemplos Práticos
        </Button>
        <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
          <Zap className="w-4 h-4 mr-1" />
          Dicas Avançadas
        </Button>
      </div>
    </div>
  );
};
