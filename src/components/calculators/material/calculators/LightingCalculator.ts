
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'length',
    label: 'Comprimento do Ambiente',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm',
    placeholder: 'Ex: 5.0',
    helpText: 'Comprimento do ambiente em metros',
    tooltip: 'Medida do comprimento do ambiente'
  },
  {
    key: 'width',
    label: 'Largura do Ambiente',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm',
    placeholder: 'Ex: 4.0',
    helpText: 'Largura do ambiente em metros',
    tooltip: 'Medida da largura do ambiente'
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
    helpText: 'Cada atividade exige iluminação específica: trabalho precisa de 500 lux (excelente), convivência 150 lux (boa), circulação 100 lux (regular). Iluminação inadequada causa fadiga visual e reduz produtividade.',
    tooltip: 'A NBR 5413 estabelece os níveis de iluminância (lux) adequados para cada tipo de ambiente conforme a atividade realizada'
  },
  {
    key: 'lampPower',
    label: 'Potência da Lâmpada',
    type: 'number',
    min: 1,
    max: 100,
    unit: 'W',
    placeholder: 'Ex: 9',
    helpText: 'LEDs são 80% mais eficientes que incandescentes. Uma LED de 9W equivale a 60W incandescente. Prefira LEDs de 6500K (branco frio) para trabalho e 3000K (branco quente) para ambientes de descanso.',
    tooltip: 'A potência define o consumo e a eficiência luminosa. LEDs modernos entregam 80-100 lumens por watt, muito superior às lâmpadas antigas'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'length', required: true, min: 0.1 },
    { field: 'width', required: true, min: 0.1 },
    { field: 'ambientType', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const length = MaterialValidator.sanitizeNumericInput(inputs.length, 0.1);
  const width = MaterialValidator.sanitizeNumericInput(inputs.width, 0.1);
  const area = length * width;
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

  const ambientLabels = {
    excellent: 'Excelente (Escritório/Cozinha)',
    good: 'Boa (Sala/Quarto)',
    regular: 'Regular (Corredor/Banheiro)'
  };

  return {
    dimensions: { value: `${length.toFixed(2)} x ${width.toFixed(2)}`, unit: 'm', category: 'info' },
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    ambientType: { value: ambientLabels[ambientType] || ambientType, unit: '', category: 'info' },
    totalPowerNeeded: { value: totalPowerNeeded.toFixed(0), unit: 'W total', category: 'secondary' },
    lampsNeeded: { value: lampsNeeded, unit: 'lâmpadas LED', highlight: true, category: 'primary' },
    lampPower: { value: lampPower, unit: 'W cada', category: 'info' },
    recommendation: { 
      value: `Distribua as ${lampsNeeded} lâmpadas uniformemente no ambiente. Para melhor resultado, use lâmpadas com ângulo de abertura de 120° e instale a cada ${Math.sqrt(area / lampsNeeded).toFixed(1)}m.`, 
      unit: '', 
      category: 'info' 
    }
  };
};

export const lightingCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Iluminação',
  description: 'Dimensionamento de pontos de luz'
};
