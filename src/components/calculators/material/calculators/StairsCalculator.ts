
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'totalHeight',
    label: 'Altura Total (cm)',
    type: 'number',
    required: true,
    min: 50,
    max: 500,
    tooltip: 'Altura total que a escada deve vencer'
  },
  {
    key: 'availableLength',
    label: 'Comprimento Disponível (cm)',
    type: 'number',
    required: true,
    min: 100,
    max: 1000,
    tooltip: 'Comprimento disponível para a escada'
  },
  {
    key: 'stepWidth',
    label: 'Largura do Degrau (cm)',
    type: 'number',
    defaultValue: 80,
    min: 60,
    max: 150,
    tooltip: 'Largura útil da escada'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'totalHeight', required: true, min: 50 },
    { field: 'availableLength', required: true, min: 100 }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const totalHeight = MaterialValidator.sanitizeNumericInput(inputs.totalHeight, 50);
  const availableLength = MaterialValidator.sanitizeNumericInput(inputs.availableLength, 100);
  const stepWidth = MaterialValidator.sanitizeNumericInput(inputs.stepWidth, 80);

  const numSteps = Math.round(totalHeight / MATERIAL_CONSTANTS.STAIRS.OPTIMAL_RISER);
  const riserHeight = totalHeight / numSteps;
  const treadDepth = (availableLength - 20) / (numSteps - 1); // 20cm para patamar

  // Verificação da fórmula de Blondel: 2R + P = 63-65cm
  const blondelCheck = 2 * riserHeight + treadDepth;
  const isComfortable = blondelCheck >= 63 && blondelCheck <= 67;

  return {
    totalHeight: { value: totalHeight.toFixed(0), unit: 'cm', category: 'info' },
    numSteps: { value: numSteps, unit: 'degraus', highlight: true, category: 'primary' },
    riserHeight: { value: riserHeight.toFixed(1), unit: 'cm', highlight: true, category: 'primary' },
    treadDepth: { value: treadDepth.toFixed(1), unit: 'cm', highlight: true, category: 'primary' },
    stepWidth: { value: stepWidth, unit: 'cm', category: 'info' },
    blondelCheck: { value: blondelCheck.toFixed(1), unit: 'cm', category: 'secondary' },
    isComfortable: { value: isComfortable ? 'Sim' : 'Não', unit: '', category: isComfortable ? 'info' : 'secondary' }
  };
};

export const stairsCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Escadas',
  description: 'Dimensionamento de degraus e conforto'
};
