
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área da Parede',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm²',
    placeholder: 'Ex: 20.0',
    helpText: 'Informe a área total da parede a ser construída',
    tooltip: 'Área total da parede em metros quadrados, descontando portas e janelas'
  },
  {
    key: 'brickType',
    label: 'Tipo de Tijolo',
    type: 'select',
    required: true,
    placeholder: 'Selecione o tipo de tijolo...',
    options: [
      { value: 'ceramic', label: 'Cerâmico comum 9x19x19cm (48 un/m²)' },
      { value: 'ceramic6holes', label: 'Cerâmico 6 furos 11x14x24cm (25 un/m²)' },
      { value: 'concrete', label: 'Concreto 14x19x39cm (12,5 un/m²)' }
    ],
    tooltip: 'Cada tipo de tijolo tem dimensões e quantidades específicas por m²'
  },
  {
    key: 'mortarThickness',
    label: 'Espessura da Argamassa',
    type: 'number',
    min: 0.5,
    max: 5,
    unit: 'cm',
    placeholder: 'Ex: 1.5',
    helpText: 'Espessura típica: 1-2cm para juntas regulares',
    tooltip: 'Espessura da junta de argamassa entre os tijolos'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'brickType', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const brickType = inputs.brickType as keyof typeof MATERIAL_CONSTANTS.MASONRY.BRICK_TYPES;
  const mortarThickness = MaterialValidator.sanitizeNumericInput(inputs.mortarThickness, 2);

  const brickData = MATERIAL_CONSTANTS.MASONRY.BRICK_TYPES[brickType];
  
  if (!brickData) {
    return {
      error: { value: 'Tipo de tijolo não encontrado', unit: '', category: 'info' }
    };
  }

  const bricksNeeded = Math.ceil(area * brickData.bricksPerM2);
  const mortarM3 = area * (mortarThickness / 100);
  const mortarKg = Math.ceil(mortarM3 * 1800); // Densidade da argamassa

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    brickType: { value: brickData.width + 'x' + brickData.height + 'x' + brickData.length + 'cm', unit: '', category: 'info' },
    bricksNeeded: { value: bricksNeeded, unit: 'tijolos', highlight: true, category: 'primary' },
    mortarKg: { value: mortarKg, unit: 'kg', highlight: true, category: 'primary' },
    mortarM3: { value: mortarM3.toFixed(3), unit: 'm³', category: 'secondary' }
  };
};

export const masonryCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Alvenaria',
  description: 'Cálculo de tijolos e argamassa para paredes'
};
