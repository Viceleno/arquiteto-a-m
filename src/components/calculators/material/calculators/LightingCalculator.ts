
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área do Ambiente (m²)',
    type: 'number',
    required: true,
    min: 0.1,
    tooltip: 'Área total do ambiente a ser iluminado'
  },
  {
    key: 'ambientType',
    label: 'Tipo de Ambiente',
    type: 'select',
    defaultValue: 'regular',
    required: true,
    options: [
      { value: 'excellent', label: 'Escritório/Cozinha (excelente)' },
      { value: 'good', label: 'Sala/Quarto (boa)' },
      { value: 'regular', label: 'Corredor/Banheiro (regular)' }
    ],
    tooltip: 'Nível de iluminação necessário'
  },
  {
    key: 'lampPower',
    label: 'Potência da Lâmpada (W)',
    type: 'number',
    defaultValue: 9,
    min: 1,
    max: 100,
    tooltip: 'Potência individual de cada lâmpada LED'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'ambientType', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const ambientType = inputs.ambientType as keyof typeof MATERIAL_CONSTANTS.LIGHTING.RATIOS;
  const lampPower = MaterialValidator.sanitizeNumericInput(inputs.lampPower, 9);

  const ratio = MATERIAL_CONSTANTS.LIGHTING.RATIOS[ambientType];
  
  if (!ratio) {
    return {
      error: { value: 'Tipo de ambiente não encontrado', unit: '', category: 'info' }
    };
  }

  const totalPowerNeeded = area * ratio * 1000; // Convertendo para W
  const lampsNeeded = Math.ceil(totalPowerNeeded / lampPower);

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    ambientType: { value: ambientType, unit: '', category: 'info' },
    totalPowerNeeded: { value: totalPowerNeeded.toFixed(0), unit: 'W', category: 'secondary' },
    lampsNeeded: { value: lampsNeeded, unit: 'lâmpadas', highlight: true, category: 'primary' },
    lampPower: { value: lampPower, unit: 'W cada', category: 'info' }
  };
};

export const lightingCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Iluminação',
  description: 'Dimensionamento de pontos de luz'
};
