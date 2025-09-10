
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
    placeholder: 'Ex: 15.5',
    helpText: 'Informe a área total da parede em drywall',
    tooltip: 'Área total da parede que será revestida com drywall'
  },
  {
    key: 'plateThickness',
    label: 'Espessura da Placa',
    type: 'select',
    required: true,
    placeholder: 'Selecione a espessura...',
    options: [
      { value: '9.5', label: '9,5mm - Standard (áreas secas)' },
      { value: '12.5', label: '12,5mm - Resistente à umidade' },
      { value: '15', label: '15mm - Resistente ao fogo' }
    ],
    tooltip: 'A espessura varia conforme o ambiente e necessidades específicas'
  },
  {
    key: 'sides',
    label: 'Número de Faces',
    type: 'select',
    required: true,
    placeholder: 'Selecione o número de faces...',
    options: [
      { value: '1', label: '1 face (revestimento de parede)' },
      { value: '2', label: '2 faces (parede divisória completa)' }
    ],
    tooltip: 'Define se é revestimento de parede existente ou parede nova'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'plateThickness', required: true },
    { field: 'sides', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const sides = MaterialValidator.sanitizeNumericInput(inputs.sides, 2);
  
  const plateArea = MATERIAL_CONSTANTS.DRYWALL.PLATE_SIZE.width * MATERIAL_CONSTANTS.DRYWALL.PLATE_SIZE.height;
  // Aplicar fator de perdas de 10% para drywall
  const adjustedArea = area * 1.10;
  const totalArea = adjustedArea * sides;
  
  const platesNeeded = Math.ceil(totalArea / plateArea);
  const screwsNeeded = platesNeeded * MATERIAL_CONSTANTS.DRYWALL.SCREWS_PER_PLATE;
  const massaKg = Math.ceil(totalArea * 0.5); // Aproximação para massa de rejunte

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    adjustedArea: { value: adjustedArea.toFixed(2), unit: 'm² (com perdas)', category: 'info' },
    totalArea: { value: totalArea.toFixed(2), unit: 'm² total', category: 'info' },
    platesNeeded: { value: platesNeeded, unit: 'placas', highlight: true, category: 'primary' },
    screwsNeeded: { value: screwsNeeded, unit: 'parafusos', category: 'secondary' },
    massaKg: { value: massaKg, unit: 'kg massa', category: 'secondary' },
    sides: { value: sides, unit: 'faces', category: 'info' }
  };
};

export const drywallCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Drywall',
  description: 'Cálculo de placas, parafusos e massa'
};
