
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'wallArea',
    label: 'Área das Paredes (m²)',
    type: 'number',
    required: true,
    min: 1,
    tooltip: 'Área total das paredes a serem pintadas'
  },
  {
    key: 'openings',
    label: 'Área de Vãos (m²)',
    type: 'number',
    defaultValue: 0,
    min: 0,
    tooltip: 'Área de portas e janelas (será descontada)'
  },
  {
    key: 'coverage',
    label: 'Rendimento (m²/L)',
    type: 'number',
    defaultValue: MATERIAL_CONSTANTS.PAINTING.DEFAULT_COVERAGE,
    min: 8,
    max: 16,
    tooltip: 'Rendimento da tinta por litro'
  },
  {
    key: 'coats',
    label: 'Número de Demãos',
    type: 'number',
    defaultValue: 2,
    min: 1,
    max: 4,
    tooltip: 'Quantidade de demãos de tinta'
  },
  {
    key: 'paintType',
    label: 'Tipo de Tinta',
    type: 'select',
    options: [
      { value: 'standard', label: 'Padrão (12 m²/L)' },
      { value: 'premium', label: 'Premium (14 m²/L)' },
      { value: 'economic', label: 'Econômica (10 m²/L)' }
    ],
    defaultValue: 'standard',
    tooltip: 'Tipo de tinta afeta o rendimento'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'wallArea', required: true, min: 1 },
    { field: 'coats', required: true, min: 1, max: 4 },
  ]);

  if (!validation.isValid) {
    return {};
  }

  const wallArea = MaterialValidator.sanitizeNumericInput(inputs.wallArea, 1);
  const openings = MaterialValidator.sanitizeNumericInput(inputs.openings);
  let coverage = MaterialValidator.sanitizeNumericInput(inputs.coverage, 8);
  const coats = MaterialValidator.sanitizeNumericInput(inputs.coats, 1);
  const paintType = inputs.paintType || 'standard';

  // Ajustar rendimento baseado no tipo de tinta
  switch (paintType) {
    case 'premium': coverage = 14; break;
    case 'economic': coverage = 10; break;
    default: coverage = 12; break;
  }

  const paintableArea = Math.max(0, wallArea - openings);
  const paintNeeded = (paintableArea * coats) / coverage;
  
  // Conversões para embalagens
  const cans18L = Math.ceil(paintNeeded / 18);
  const gallons36L = Math.ceil(paintNeeded / 3.6);
  
  // Selador (se necessário)
  const sealerNeeded = paintableArea / MATERIAL_CONSTANTS.PAINTING.SEALER_COVERAGE;
  
  // Massa corrida (estimativa)
  const fillerNeeded = paintableArea * 0.3; // kg/m²

  return {
    paintableArea: { value: paintableArea.toFixed(2), unit: 'm²', category: 'info' },
    paintNeeded: { value: paintNeeded.toFixed(2), unit: 'L', highlight: true, category: 'primary' },
    cans18L: { value: cans18L, unit: 'latas 18L', highlight: true, category: 'primary' },
    gallons36L: { value: gallons36L, unit: 'galões 3,6L', category: 'secondary' },
    sealerNeeded: { value: sealerNeeded.toFixed(2), unit: 'L', category: 'secondary' },
    fillerNeeded: { value: fillerNeeded.toFixed(1), unit: 'kg', category: 'secondary' },
    coats: { value: coats, unit: 'demãos', category: 'info' },
    coverage: { value: coverage, unit: 'm²/L', category: 'info' }
  };
};

export const paintingCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Pintura',
  description: 'Cálculo de tinta, selador e massa corrida'
};
