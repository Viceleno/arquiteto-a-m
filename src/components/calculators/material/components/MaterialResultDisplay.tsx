
import React from 'react';
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
      area: 'Área',
      piecesNeeded: 'Peças necessárias',
      boxes: 'Caixas',
      mortarKg: 'Argamassa colante',
      groutKg: 'Rejunte',
      wasteFactor: 'Fator de perda',
      pieceArea: 'Área por peça',
      paintableArea: 'Área pintável',
      paintNeeded: 'Tinta necessária',
      cans18L: 'Latas 18L',
      gallons36L: 'Galões 3,6L',
      sealerNeeded: 'Selador',
      fillerNeeded: 'Massa corrida',
      coats: 'Demãos',
      coverage: 'Rendimento',
      bricksNeeded: 'Tijolos necessários',
      mortarM3: 'Argamassa (m³)',
      tilesNeeded: 'Telhas necessárias',
      drywallArea: 'Área de drywall',
      structureLength: 'Estrutura metálica',
      lampsNeeded: 'Lâmpadas necessárias',
      totalPowerNeeded: 'Potência total',
      lampPower: 'Potência por lâmpada',
      ambientType: 'Tipo de ambiente',
      steps: 'Degraus',
      risers: 'Espelhos',
      stepDepth: 'Profundidade do degrau',
      stepHeight: 'Altura do degrau',
      concreteM3: 'Concreto (m³)',
      cement: 'Cimento',
      sand: 'Areia',
      gravel: 'Brita',
      water: 'Água',
      steelKg: 'Aço (kg)'
    };
    return labels[key] || key;
  };

  const renderResultGroup = (title: string, items: [string, any][], className = '') => {
    if (items.length === 0) return null;

    return (
      <div className={`space-y-3 ${className}`}>
        <h4 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
          {title}
        </h4>
        <div className="space-y-2">
          {items.map(([key, data]) => (
            <div 
              key={key} 
              className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-lg ${
                data.highlight ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <span className="text-sm font-medium text-foreground mb-1 sm:mb-0">
                {formatLabel(key)}:
              </span>
              <span className={`text-sm sm:text-right ${
                data.highlight ? 'font-bold text-primary' : 'text-foreground'
              }`}>
                {data.value} {data.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-green-50 dark:bg-green-950/20 p-4 sm:p-6 rounded-lg border border-green-200 dark:border-green-800 space-y-4 sm:space-y-6">
      <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg sm:text-xl mb-4">
        Resultado - {categoryName}
      </h3>
      
      {renderResultGroup('Materiais Principais', groupedResults.primary, 'mb-4')}
      {renderResultGroup('Materiais Auxiliares', groupedResults.secondary, 'mb-4')}
      {renderResultGroup('Informações Técnicas', groupedResults.info)}
    </div>
  );
};
