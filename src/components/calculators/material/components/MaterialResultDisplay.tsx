
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  // Extrai alertas do resultado (se houver)
  const alertsData = result.alerts;
  const alerts = alertsData ? String(alertsData.value).split('|||') : [];
  
  // Filtra o campo alerts e sandSwellingNote das exibições normais
  const filteredResult = Object.fromEntries(
    Object.entries(result).filter(([key]) => key !== 'alerts' && key !== 'sandSwellingNote')
  );
  
  const sandSwellingNote = result.sandSwellingNote;
  
  const groupedResults = {
    primary: Object.entries(filteredResult).filter(([_, data]) => data.category === 'primary'),
    secondary: Object.entries(filteredResult).filter(([_, data]) => data.category === 'secondary'),
    info: Object.entries(filteredResult).filter(([_, data]) => data.category === 'info' || !data.category)
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
      // Labels para alvenaria
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
      totalWaterL: 'Água Total',
      // Labels para piso e revestimento
      installationType: 'Tipo de Instalação',
      mortarType: 'Tipo de Argamassa',
      spacersKg: 'Espaçadores Plásticos',
      sealerL: 'Impermeabilizante',
      cleanerL: 'Produto de Limpeza',
      adhesiveKg: 'Cola Específica',
      underlaymentM2: 'Manta Acústica',
      transitionBarsM: 'Barras de Transição',
      adhesiveType: 'Tipo de Adesivo',
      // Labels para pintura
      surfaceType: 'Tipo de Superfície',
      paintType: 'Tipo de Tinta',
      sealerCans: 'Galões de Selador',
      fillerBags: 'Sacos de Massa Corrida',
      sandpaperM2: 'Lixa para Preparação',
      brushes: 'Pincéis',
      rollers: 'Rolos de Pintura',
      plasticM2: 'Lona Plástica',
      // Labels para concreto
      concreteType: 'Resistência FCK',
      slumpType: 'Consistência Slump',
      ratio: 'Traço de Concreto',
      cementKg: 'Cimento Portland',
      cementBags: 'Sacos de Cimento',
      sandM3: 'Areia Média',
      sandTons: 'Areia (Toneladas)',
      gravelM3: 'Brita Graduada',
      gravelTons: 'Brita (Toneladas)',
      waterL: 'Água Potável',
      steelBars: 'Barras de Aço',
      wireKg: 'Arame Recozido',
      spacersUn: 'Espaçadores de Concreto',
      curingCompoundL: 'Composto de Cura',
      sandHumidityInfo: 'Umidade da Areia',
      sandSwellingNote: 'Ajuste de Inchamento',
      steelLoss: 'Perda de Aço',
      alerts: 'Alertas',
      // Labels para cobertura
      tileType: 'Tipo de Telha',
      ridgeLength: 'Comprimento Cumeeira',
      raftersM: 'Caibros de Madeira',
      tilesM: 'Ripas de Madeira',
      ridgeBeamM: 'Viga de Cumeeira',
      nailsKg: 'Pregos Galvanizados',
      wireM: 'Arame de Amarração',
      purlinM: 'Perfis Estruturais',
      boltsUn: 'Parafusos de Fixação',
      washersUn: 'Arruelas de Vedação',
      sealantTubes: 'Tubos de Vedante',
      screwsUn: 'Parafusos Autobrocantes',
      flashingM: 'Rufos e Calhas',
      insulationM2: 'Isolamento Térmico',
      gutterM: 'Calhas de Drenagem',
      downspoutM: 'Condutores Verticais',
      membraneM2: 'Manta Sub-cobertura'
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

  // Explicações didáticas específicas por categoria
  const getEducationalContent = () => {
    switch (categoryName) {
      case 'Alvenaria':
        return (
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
              
              {result.renderArea && (
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
            </CardContent>
          </Card>
        );

      case 'Piso e Revestimento':
        return (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100 text-base">
                <BookOpen className="w-4 h-4" />
                Explicação Técnica - Sistemas de Assentamento (NBR 14081)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-green-900 dark:text-green-100">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">🏺 Cerâmica/Porcelanato</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Argamassa:</strong> AC-II (4kg/m²) para pisos internos, AC-III para externos</li>
                  <li><strong>Rejunte:</strong> 0,7kg/m² - use rejunte flexível em áreas molhadas</li>
                  <li><strong>Espaçadores:</strong> Garantem juntas uniformes (1-3mm para pisos)</li>
                </ul>
              </div>
              
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">🪨 Pedra Natural</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Argamassa específica:</strong> 6kg/m² - resistente a manchas</li>
                  <li><strong>Impermeabilização:</strong> Obrigatória para evitar eflorescência</li>
                  <li><strong>Limpeza:</strong> Produtos específicos para cada tipo de pedra</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 'Pintura':
        return (
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100 text-base">
                <BookOpen className="w-4 h-4" />
                Explicação Técnica - Sistemas de Pintura (NBR 15079)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-purple-900 dark:text-purple-100">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">🎨 Preparação da Superfície</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Lixamento:</strong> Remove imperfeições e promove aderência</li>
                  <li><strong>Massa corrida:</strong> 0,5kg/m² para regularização</li>
                  <li><strong>Selador:</strong> 10m²/L - uniformiza absorção da superfície</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">🖌️ Aplicação da Tinta</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Rendimento:</strong> Varia de 6-14 m²/L conforme superfície e tinta</li>
                  <li><strong>Demãos:</strong> Mínimo 2 demãos com intervalo de 4h entre elas</li>
                  <li><strong>Diluição:</strong> Primeira demão 10% de água, segunda sem diluição</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 'Concreto':
        return (
          <Card className="border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-base">
                <BookOpen className="w-4 h-4" />
                Explicação Técnica - Dosagem de Concreto (NBR 6118)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-900 dark:text-gray-100">
              <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">🏗️ Traços por Resistência</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>FCK 20 MPa:</strong> 1:2,5:3,5 (280kg cimento/m³) - residencial leve</li>
                  <li><strong>FCK 25 MPa:</strong> 1:2:3 (350kg cimento/m³) - uso geral</li>
                  <li><strong>FCK 30 MPa:</strong> 1:1,5:2,5 (420kg cimento/m³) - estrutural</li>
                </ul>
              </div>
              
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">⚡ Armadura e Cura</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Aço CA-50:</strong> 80-100kg/m³ conforme espessura da laje</li>
                  <li><strong>Cura úmida:</strong> 7 dias mínimo para atingir resistência</li>
                  <li><strong>Slump test:</strong> Controla trabalhabilidade do concreto fresco</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 'Cobertura':
        return (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100 text-base">
                <BookOpen className="w-4 h-4" />
                Explicação Técnica - Sistemas de Cobertura (NBR 15575)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-red-900 dark:text-red-100">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">🏠 Estrutura de Madeira</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Caibros:</strong> 5x6cm espaçados a cada 50-60cm</li>
                  <li><strong>Ripas:</strong> 2x5cm espaçadas conforme tipo de telha</li>
                  <li><strong>Fixação:</strong> Pregos galvanizados + arame de amarração</li>
                </ul>
              </div>
              
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">💧 Sistema de Drenagem</h4>
                <ul className="space-y-1 text-xs">
                  <li><strong>Calhas:</strong> Dimensionadas conforme área de captação</li>
                  <li><strong>Condutores:</strong> Diâmetro mínimo 75mm para residencial</li>
                  <li><strong>Inclinação:</strong> Mínimo 0,5% para escoamento adequado</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Dica:</strong> Sempre consulte um profissional qualificado para validar os cálculos em projetos complexos e siga as normas técnicas brasileiras.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <CheckCircle className="w-5 h-5" />
            Resultado - {categoryName}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Alertas de Compatibilidade */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const isWarning = alert.startsWith('⚠️');
            const isTip = alert.startsWith('💡');
            return (
              <Alert 
                key={index} 
                variant={isWarning ? 'destructive' : 'default'}
                className={isTip ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30' : ''}
              >
                <AlertTriangle className={`h-4 w-4 ${isTip ? 'text-blue-600' : ''}`} />
                <AlertTitle className={isTip ? 'text-blue-900 dark:text-blue-100' : ''}>
                  {isWarning ? 'Alerta de Compatibilidade' : isTip ? 'Dica de Otimização' : 'Atenção'}
                </AlertTitle>
                <AlertDescription className={isTip ? 'text-blue-800 dark:text-blue-200' : ''}>
                  {alert.replace(/^[⚠️💡]\s*/, '')}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Nota de ajuste de inchamento da areia */}
      {sandSwellingNote && (
        <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">Ajuste por Umidade da Areia (NBR 9775)</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {String(sandSwellingNote.value)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {renderResultGroup(getCategoryTitle('primary'), groupedResults.primary, 'primary')}
        {renderResultGroup(getCategoryTitle('secondary'), groupedResults.secondary, 'secondary')}
        {renderResultGroup(getCategoryTitle('info'), groupedResults.info, 'info')}
      </div>

      {getEducationalContent()}

      {/* Aviso importante */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-100">
              <p className="font-medium mb-1">Importante:</p>
              <p>
                Os cálculos seguem as normas técnicas brasileiras (ABNT). 
                Considere adicionar 5-10% de perda aos materiais principais. Sempre consulte um 
                profissional qualificado para validação e detalhamento do projeto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
