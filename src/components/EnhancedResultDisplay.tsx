import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Save, 
  Download, 
  Share2, 
  Copy, 
  CheckCircle,
  TrendingUp,
  Zap,
  Target,
  BookOpen
} from 'lucide-react';

interface EnhancedResultDisplayProps {
  result: {
    area: number;
    volume?: number;
  };
  shape: string;
  dimensions: Record<string, number>;
  calcVolume: boolean;
  onSave: () => void;
  onShare?: () => void;
}

export const EnhancedResultDisplay: React.FC<EnhancedResultDisplayProps> = ({
  result,
  shape,
  dimensions,
  calcVolume,
  onSave,
  onShare
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getShapeLabel = () => {
    switch (shape) {
      case 'rectangle': return 'Retângulo';
      case 'circle': return 'Círculo';
      case 'triangle': return 'Triângulo';
      default: return 'Forma';
    }
  };

  const getShapeEmoji = () => {
    switch (shape) {
      case 'rectangle': return '📐';
      case 'circle': return '⭕';
      case 'triangle': return '🔺';
      default: return '📏';
    }
  };

  const formatDimensions = () => {
    switch (shape) {
      case 'rectangle':
        return `${dimensions.width}m × ${dimensions.height}m`;
      case 'circle':
        return `Raio: ${dimensions.radius}m`;
      case 'triangle':
        return `Base: ${dimensions.base}m, Altura: ${dimensions.height}m`;
      default:
        return '';
    }
  };

  const getResultSummary = () => {
    let summary = `${getShapeEmoji()} ${getShapeLabel()}: ${formatDimensions()}\n`;
    summary += `📐 Área: ${result.area.toFixed(2)} m²\n`;
    if (calcVolume && result.volume) {
      summary += `📦 Volume: ${result.volume.toFixed(2)} m³`;
    }
    return summary;
  };

  const getInsights = () => {
    const insights = [];
    
    // Insight sobre área
    if (result.area < 10) {
      insights.push({ type: 'info', text: 'Área pequena - ideal para ambientes compactos' });
    } else if (result.area < 50) {
      insights.push({ type: 'success', text: 'Área média - boa para quartos e salas' });
    } else {
      insights.push({ type: 'warning', text: 'Área grande - considere divisões internas' });
    }

    // Insight sobre volume
    if (calcVolume && result.volume) {
      if (result.volume < 30) {
        insights.push({ type: 'info', text: 'Volume pequeno - baixo consumo de materiais' });
      } else if (result.volume < 100) {
        insights.push({ type: 'success', text: 'Volume médio - consumo moderado de materiais' });
      } else {
        insights.push({ type: 'warning', text: 'Volume grande - alto consumo de materiais' });
      }
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Resultado Principal */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">
                  Cálculo Concluído!
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Resultados para {getShapeLabel()}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <Zap className="w-3 h-3 mr-1" />
              Preciso
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Dimensões */}
          <div className="bg-white/60 rounded-lg p-4 border border-white/20">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Dimensões Informadas
            </h4>
            <div className="text-lg font-mono text-gray-700">
              {formatDimensions()}
            </div>
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4 border border-white/20 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {result.area.toFixed(2)} m²
              </div>
              <div className="text-sm font-medium text-gray-700">Área</div>
              <div className="text-xs text-gray-500 mt-1">
                {getShapeLabel()}
              </div>
            </div>
            
            {calcVolume && result.volume && (
              <div className="bg-white/60 rounded-lg p-4 border border-white/20 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {result.volume.toFixed(2)} m³
                </div>
                <div className="text-sm font-medium text-gray-700">Volume</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getShapeLabel()} 3D
                </div>
              </div>
            )}
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                Insights Profissionais
              </h4>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      insight.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                      insight.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                      'bg-orange-50 text-orange-800 border border-orange-200'
                    }`}
                  >
                    {insight.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onSave}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar no Histórico
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => copyToClipboard(getResultSummary())}
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Resultado
                </>
              )}
            </Button>
            
            {onShare && (
              <Button 
                variant="outline"
                onClick={onShare}
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-purple-900">
                Informações Técnicas
              </CardTitle>
              <CardDescription className="text-purple-700">
                Baseado em normas técnicas brasileiras
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-purple-900 mb-2">Fórmulas Utilizadas:</div>
              <div className="space-y-1 text-purple-700">
                {shape === 'rectangle' && (
                  <div>• Área = largura × altura</div>
                )}
                {shape === 'circle' && (
                  <div>• Área = π × raio²</div>
                )}
                {shape === 'triangle' && (
                  <div>• Área = (base × altura) ÷ 2</div>
                )}
                {calcVolume && (
                  <div>• Volume = área × profundidade</div>
                )}
              </div>
            </div>
            
            <div>
              <div className="font-semibold text-purple-900 mb-2">Normas de Referência:</div>
              <div className="space-y-1 text-purple-700">
                <div>• NBR 12721 (ABNT)</div>
                <div>• Medição de áreas</div>
                <div>• Precisão: 2 casas decimais</div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-purple-200">
            <p className="text-xs text-purple-600">
              <strong>Nota:</strong> Os cálculos seguem rigorosamente as normas técnicas brasileiras. 
              Para projetos oficiais, sempre consulte um profissional habilitado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
