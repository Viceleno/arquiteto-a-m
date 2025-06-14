
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Info, AlertTriangle, TrendingUp, BookOpen, Lightbulb } from 'lucide-react';
import { MaterialResult } from '../MaterialCalculatorTypes';

interface MaterialResultDisplayProps {
  result: MaterialResult;
  categoryName: string;
}

export const MaterialResultDisplay: React.FC<MaterialResultDisplayProps> = ({
  result,
  categoryName
}) => {
  const groupedResults = {
    primary: Object.entries(result).filter(([_, data]) => data.category === 'primary'),
    secondary: Object.entries(result).filter(([_, data]) => data.category === 'secondary'),
    info: Object.entries(result).filter(([_, data]) => data.category === 'info' || !data.category)
  };

  const formatLabel = (key: string) => {
    const labels: Record<string, string> = {
      area: 'Área Total',
      adjustedArea: 'Área com Perdas',
      piecesNeeded: 'Peças Necessárias',
      boxes: 'Caixas/Embalagens',
      mortarKg: 'Argamassa Colante',
      groutKg: 'Rejunte',
      wasteFactor: 'Fator de Perda',
      pieceArea: 'Área por Peça',
      paintableArea: 'Área Pintável',
      paintNeeded: 'Tinta Necessária',
      cans18L: 'Latas de 18L',
      gallons36L: 'Galões de 3,6L',
      sealerNeeded: 'Selador',
      fillerNeeded: 'Massa Corrida',
      coats: 'Demãos',
      coverage: 'Rendimento',
      bricksNeeded: 'Tijolos Necessários',
      mortarM3: 'Argamassa (m³)',
      tilesNeeded: 'Telhas Necessárias',
      ridgeTiles: 'Cumeeiras',
      drywallArea: 'Área de Drywall',
      structureLength: 'Estrutura Metálica',
      lampsNeeded: 'Lâmpadas Necessárias',
      totalPowerNeeded: 'Potência Total',
      lampPower: 'Potência por Lâmpada',
      ambientType: 'Tipo de Ambiente',
      numSteps: 'Número de Degraus',
      riserHeight: 'Altura do Espelho',
      treadDepth: 'Profundidade do Piso',
      concreteNeeded: 'Concreto Necessário',
      cement: 'Cimento',
      sand: 'Areia',
      gravel: 'Brita',
      water: 'Água',
      steelKg: 'Aço CA-50',
      volume: 'Volume',
      thickness: 'Espessura',
      platesNeeded: 'Placas de Drywall',
      screwsNeeded: 'Parafusos',
      massaKg: 'Massa de Rejunte',
      sides: 'Faces',
      totalArea: 'Área Total',
      brickType: 'Tipo de Tijolo',
      slope: 'Inclinação',
      stepWidth: 'Largura da Escada',
      blondelCheck: 'Fórmula de Blondel',
      isComfortable: 'Escada Confortável',
      totalHeight: 'Altura Total',
      // Novos labels para alvenaria
      mortarVolumeM3: 'Volume Argamassa Assentamento',
      cementLayingKg: 'Cimento para Assentamento',
      sandLayingKg: 'Areia para Assentamento',
      waterLayingL: 'Água para Assentamento',
      layingRatio: 'Traço de Assentamento',
      mortarThickness: 'Espessura da Junta',
      renderArea: 'Área de Reboco',
      renderVolumeM3: 'Volume de Reboco',
      renderThickness: 'Espessura do Reboco',
      faces: 'Faces da Parede',
      cementRenderKg: 'Cimento para Reboco',
      limeRenderKg: 'Cal Hidratada',
      sandRenderKg: 'Areia para Reboco',
      waterRenderL: 'Água para Reboco',
      renderRatio: 'Traço de Reboco',
      totalCementKg: 'Cimento Total',
      totalSandKg: 'Areia Total',
      totalWaterL: 'Água Total'
    };
    return labels[key] || key;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'primary': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'secondary': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'primary': return 'Materiais Principais';
      case 'secondary': return 'Materiais Auxiliares';
      default: return 'Informações Técnicas';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'primary': return 'Itens essenciais para execução do projeto';
      case 'secondary': return 'Materiais complementares e auxiliares';
      default: return 'Dados técnicos e parâmetros utilizados';
    }
  };

  const renderResultGroup = (title: string, items: [string, any][], category: string) => {
    if (items.length === 0) return null;

    return (
      <Card className="border-l-4 border-l-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {getCategoryIcon(category)}
            {title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {getCategoryDescription(category)}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map(([key, data], index) => (
            <div key={key}>
              <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-lg transition-colors ${
                data.highlight 
                  ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}>
                <div className="flex items-center gap-2 mb-1 sm:mb-0">
                  <span className="text-sm font-medium text-foreground">
                    {formatLabel(key)}
                  </span>
                  {data.highlight && (
                    <Badge variant="secondary" className="text-xs">
                      Principal
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    data.highlight ? 'text-primary' : 'text-foreground'
                  }`}>
                    {typeof data.value === 'number' ? 
                      data.value.toLocaleString('pt-BR') : 
                      data.value
                    }
                  </span>
                  {data.unit && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {data.unit}
                    </span>
                  )}
                </div>
              </div>
              {index < items.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Explicações didáticas específicas para alvenaria
  const getMasonryEducationalContent = () => {
    const hasRender = result.renderArea;
    
    return (
      <div className="space-y-4">
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100 text-base">
              <BookOpen className="w-4 h-4" />
              Explicação Técnica - Traços de Argamassa (ABNT)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-semibold mb-2">🧱 Argamassa de Assentamento (NBR 8545)</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Traço:</strong> 1:3 (1 parte de cimento : 3 partes de areia)</li>
                <li><strong>Função:</strong> Fixar e unir os tijolos, garantindo estabilidade estrutural</li>
                <li><strong>Espessura:</strong> 1,0 a 2,0 cm (recomendado 1,5 cm)</li>
                <li><strong>Consumo:</strong> ~310 kg cimento + 1.100 kg areia por m³</li>
              </ul>
            </div>
            
            {hasRender && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">🎨 Argamassa de Reboco (NBR 13749)</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Traço:</strong> 1:2:8 (1 parte de cimento : 2 partes de cal : 8 partes de areia)</li>
                  <li><strong>Função:</strong> Revestir e regularizar a superfície da alvenaria</li>
                  <li><strong>Espessura:</strong> 1,5 a 2,5 cm conforme NBR 13749</li>
                  <li><strong>Cal hidratada:</strong> Melhora trabalhabilidade e retenção de água</li>
                </ul>
              </div>
            )}
            
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Dicas de Execução</h4>
              <ul className="space-y-1 text-xs">
                <li>• Umedeça os tijolos antes do assentamento</li>
                <li>• Mantenha as juntas uniformes e alinhadas</li>
                <li>• Execute o reboco em duas etapas: chapisco + reboco</li>
                <li>• Cure a argamassa mantendo-a úmida por 3-7 dias</li>
                <li>• Adicione 10% de perda aos materiais calculados</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Informações didáticas baseada na categoria
  const getEducationalContent = () => {
    if (categoryName === 'Alvenaria') {
      return getMasonryEducationalContent();
    }
    
    const educationalTips: Record<string, string> = {
      'Piso e Revestimento': 'Sempre considere 10-15% de perda para recortes e quebras. Compre algumas peças extras para futuras manutenções.',
      'Pintura': 'O rendimento da tinta varia conforme a superfície. Paredes texturizadas consomem mais tinta que superfícies lisas.',
      'Cobertura': 'Considere a inclinação do telhado para calcular a área real. Telhados com maior inclinação precisam de mais telhas.',
      'Drywall': 'Estruturas metálicas devem estar bem niveladas para facilitar a instalação das placas.',
      'Iluminação': 'Distribua uniformemente os pontos de luz. Considere luz natural disponível no ambiente.',
      'Escadas': 'A fórmula de Blondel (2h + p = 63-65cm) garante conforto e segurança na escada.',
      'Concreto': 'Concreto deve ser aplicado em até 2 horas após o preparo. Mantenha úmido por 7 dias para cura adequada.'
    };

    return (
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-900 dark:text-blue-100">
          <strong>Dica:</strong> {educationalTips[categoryName] || 'Sempre consulte um profissional para validar os cálculos em projetos complexos.'}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <CheckCircle className="w-5 h-5" />
            Resultado - {categoryName}
          </CardTitle>
          {categoryName !== 'Alvenaria' && getEducationalContent()}
        </CardHeader>
      </Card>
      
      <div className="space-y-4">
        {renderResultGroup(getCategoryTitle('primary'), groupedResults.primary, 'primary')}
        {renderResultGroup(getCategoryTitle('secondary'), groupedResults.secondary, 'secondary')}
        {renderResultGroup(getCategoryTitle('info'), groupedResults.info, 'info')}
      </div>

      {categoryName === 'Alvenaria' && getEducationalContent()}

      {/* Aviso importante */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-100">
              <p className="font-medium mb-1">Importante:</p>
              <p>
                Os cálculos seguem as normas ABNT NBR 8545 (argamassa de assentamento) e NBR 13749 (reboco). 
                Considere adicionar 5-10% de perda aos materiais. Sempre consulte um 
                profissional qualificado para validação do projeto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
