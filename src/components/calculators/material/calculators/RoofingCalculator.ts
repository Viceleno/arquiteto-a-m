
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área do Telhado (m²)',
    type: 'number',
    required: true,
    min: 0.1,
    tooltip: 'Área total do telhado'
  },
  {
    key: 'tileType',
    label: 'Tipo de Telha',
    type: 'select',
    defaultValue: 'ceramic',
    required: true,
    options: [
      { value: 'ceramic', label: 'Cerâmica' },
      { value: 'concrete', label: 'Concreto' },
      { value: 'fiber', label: 'Fibrocimento' },
      { value: 'metal', label: 'Metálica' }
    ],
    tooltip: 'Material da telha'
  },
  {
    key: 'slope',
    label: 'Inclinação (%)',
    type: 'number',
    defaultValue: 30,
    min: 5,
    max: 100,
    tooltip: 'Inclinação do telhado em percentual'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'tileType', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const tileType = inputs.tileType as keyof typeof MATERIAL_CONSTANTS.ROOFING.TILE_TYPES;
  const slope = MaterialValidator.sanitizeNumericInput(inputs.slope, 30);

  const tileData = MATERIAL_CONSTANTS.ROOFING.TILE_TYPES[tileType];
  
  if (!tileData) {
    return {
      error: { value: 'Tipo de telha não encontrado', unit: '', category: 'info' }
    };
  }

  const adjustedArea = area * (1 + MATERIAL_CONSTANTS.ROOFING.WASTE_FACTOR);
  const tilesNeeded = Math.ceil(adjustedArea * tileData.tilesPerM2);
  const ridgeTiles = Math.ceil(area * 0.05); // Aproximação para cumeeiras

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    adjustedArea: { value: adjustedArea.toFixed(2), unit: 'm²', category: 'info' },
    tilesNeeded: { value: tilesNeeded, unit: 'telhas', highlight: true, category: 'primary' },
    ridgeTiles: { value: ridgeTiles, unit: 'cumeeiras', category: 'secondary' },
    slope: { value: slope, unit: '%', category: 'info' }
  };
};

export const roofingCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Cobertura',
  description: 'Cálculo de telhas e acessórios'
};
