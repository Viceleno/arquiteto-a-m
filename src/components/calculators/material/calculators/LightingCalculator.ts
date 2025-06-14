
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área do Ambiente',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm²',
    placeholder: 'Ex: 25.5',
    helpText: 'Informe a área total do ambiente que será iluminado',
    tooltip: 'Área total do ambiente a ser iluminado em metros quadrados'
  },
  {
    key: 'ambientType',
    label: 'Tipo de Ambiente',
    type: 'select',
    required: true,
    placeholder: 'Selecione o tipo de ambiente...',
    options: [
      { value: 'excellent', label: 'Escritório/Cozinha (excelente iluminação)' },
      { value: 'good', label: 'Sala/Quarto (boa iluminação)' },
      { value: 'regular', label: 'Corredor/Banheiro (iluminação regular)' }
    ],
    tooltip: 'Cada ambiente requer um nível diferente de iluminação conforme NBR 5413'
  },
  {
    key: 'lampPower',
    label: 'Potência da Lâmpada',
    type: 'number',
    min: 1,
    max: 100,
    unit: 'W',
    placeholder: 'Ex: 9',
    helpText: 'Potência individual de cada lâmpada LED que será utilizada',
    tooltip: 'Potência individual de cada lâmpada LED em watts'
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
