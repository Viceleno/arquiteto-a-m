
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'length',
    label: 'Comprimento da Parede',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm',
    placeholder: 'Ex: 8.0',
    helpText: 'Comprimento da parede de drywall',
    tooltip: 'Medida do comprimento em metros'
  },
  {
    key: 'height',
    label: 'Altura da Parede',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm',
    placeholder: 'Ex: 2.8',
    helpText: 'Altura da parede (pé-direito)',
    tooltip: 'Medida da altura em metros'
  },
  {
    key: 'doorCount',
    label: 'Quantidade de Portas',
    type: 'number',
    min: 0,
    defaultValue: 0,
    unit: 'unidades',
    placeholder: 'Ex: 1',
    helpText: 'Número de portas na parede (1,68m² cada)',
    tooltip: 'Área descontada por porta'
  },
  {
    key: 'windowCount',
    label: 'Quantidade de Janelas',
    type: 'number',
    min: 0,
    defaultValue: 0,
    unit: 'unidades',
    placeholder: 'Ex: 1',
    helpText: 'Número de janelas na parede (1,20m² cada)',
    tooltip: 'Área descontada por janela'
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
    { field: 'length', required: true, min: 0.1 },
    { field: 'height', required: true, min: 0.1 },
    { field: 'plateThickness', required: true },
    { field: 'sides', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const length = MaterialValidator.sanitizeNumericInput(inputs.length, 0.1);
  const height = MaterialValidator.sanitizeNumericInput(inputs.height, 0.1);
  const doorCount = MaterialValidator.sanitizeNumericInput(inputs.doorCount, 0);
  const windowCount = MaterialValidator.sanitizeNumericInput(inputs.windowCount, 0);
  const sides = MaterialValidator.sanitizeNumericInput(inputs.sides, 2);
  
  const totalAreaBeforeDiscount = length * height;
  const discountArea = (doorCount * 1.68) + (windowCount * 1.20);
  const area = Math.max(0.1, totalAreaBeforeDiscount - discountArea);
  
  const plateArea = MATERIAL_CONSTANTS.DRYWALL.PLATE_SIZE.width * MATERIAL_CONSTANTS.DRYWALL.PLATE_SIZE.height;
  // Aplicar fator de perdas de 10% para drywall
  const adjustedArea = area * 1.10;
  const totalAreaCovered = adjustedArea * sides;
  
  const platesNeeded = Math.ceil(totalAreaCovered / plateArea);
  const screwsNeeded = platesNeeded * MATERIAL_CONSTANTS.DRYWALL.SCREWS_PER_PLATE;
  const massaKg = Math.ceil(totalAreaCovered * 0.5); // Aproximação para massa de rejunte

  return {
    dimensions: { value: `${length.toFixed(2)} x ${height.toFixed(2)}`, unit: 'm', category: 'info' },
    totalAreaBeforeDiscount: { value: totalAreaBeforeDiscount.toFixed(2), unit: 'm²', category: 'info' },
    discountArea: { value: discountArea.toFixed(2), unit: 'm²', category: 'info' },
    area: { value: area.toFixed(2), unit: 'm² (líquida)', category: 'info' },
    adjustedArea: { value: adjustedArea.toFixed(2), unit: 'm² (com perdas)', category: 'info' },
    totalAreaCovered: { value: totalAreaCovered.toFixed(2), unit: 'm² total', category: 'info' },
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
