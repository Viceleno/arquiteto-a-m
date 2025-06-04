
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área da Parede (m²)',
    type: 'number',
    required: true,
    min: 0.1,
    tooltip: 'Área total da parede em drywall'
  },
  {
    key: 'plateThickness',
    label: 'Espessura da Placa (mm)',
    type: 'select',
    defaultValue: '12.5',
    required: true,
    options: [
      { value: '9.5', label: '9,5mm - Standard' },
      { value: '12.5', label: '12,5mm - Resistente à umidade' },
      { value: '15', label: '15mm - Resistente ao fogo' }
    ],
    tooltip: 'Espessura da placa de drywall'
  },
  {
    key: 'sides',
    label: 'Número de Faces',
    type: 'select',
    defaultValue: '2',
    required: true,
    options: [
      { value: '1', label: '1 face (revestimento)' },
      { value: '2', label: '2 faces (parede completa)' }
    ],
    tooltip: 'Quantidade de faces a revestir'
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
  const totalArea = area * sides;
  
  const platesNeeded = Math.ceil(totalArea / plateArea);
  const screwsNeeded = platesNeeded * MATERIAL_CONSTANTS.DRYWALL.SCREWS_PER_PLATE;
  const massaKg = Math.ceil(totalArea * 0.5); // Aproximação para massa de rejunte

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    totalArea: { value: totalArea.toFixed(2), unit: 'm²', category: 'info' },
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
