
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
      coverage: 'Rendimento'
    };
    return labels[key] || key;
  };

  const renderResultGroup = (title: string, items: [string, any][], className = '') => {
    if (items.length === 0) return null;

    return (
      <div className={`space-y-2 ${className}`}>
        <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">
          {title}
        </h4>
        <div className="space-y-1">
          {items.map(([key, data]) => (
            <div 
              key={key} 
              className={`flex justify-between items-center p-2 rounded ${
                data.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium text-gray-700">
                {formatLabel(key)}:
              </span>
              <span className={`text-sm ${data.highlight ? 'font-bold text-blue-700' : 'text-gray-900'}`}>
                {data.value} {data.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-4">
      <h3 className="font-semibold text-green-900 text-lg mb-4">
        Resultado - {categoryName}
      </h3>
      
      {renderResultGroup('Materiais Principais', groupedResults.primary, 'mb-4')}
      {renderResultGroup('Materiais Auxiliares', groupedResults.secondary, 'mb-4')}
      {renderResultGroup('Informações Técnicas', groupedResults.info)}
    </div>
  );
};
