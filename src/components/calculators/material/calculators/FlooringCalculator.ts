
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área a Revestir (m²)',
    type: 'number',
    required: true,
    min: 0.1,
    tooltip: 'Área total a ser revestida'
  },
  {
    key: 'pieceLength',
    label: 'Comprimento da Peça (cm)',
    type: 'number',
    defaultValue: 60,
    min: 1,
    max: 200,
    tooltip: 'Comprimento individual da peça'
  },
  {
    key: 'pieceWidth',
    label: 'Largura da Peça (cm)',
    type: 'number',
    defaultValue: 60,
    min: 1,
    max: 200,
    tooltip: 'Largura individual da peça'
  },
  {
    key: 'wasteFactor',
    label: 'Fator de Perda (%)',
    type: 'number',
    defaultValue: MATERIAL_CONSTANTS.FLOORING.DEFAULT_WASTE_FACTOR,
    min: 0,
    max: 50,
    tooltip: 'Percentual de perda durante a instalação'
  },
  {
    key: 'boxSize',
    label: 'Peças por Caixa',
    type: 'number',
    defaultValue: 10,
    min: 1,
    tooltip: 'Quantidade de peças por embalagem'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  // Valida apenas campos específicos do piso
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'pieceLength', required: true, min: 1 },
    { field: 'pieceWidth', required: true, min: 1 },
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const pieceLength = MaterialValidator.sanitizeNumericInput(inputs.pieceLength, 1);
  const pieceWidth = MaterialValidator.sanitizeNumericInput(inputs.pieceWidth, 1);
  const wasteFactor = MaterialValidator.sanitizeNumericInput(inputs.wasteFactor, 0);
  const boxSize = MaterialValidator.sanitizeNumericInput(inputs.boxSize, 1);

  // Cálculos
  const pieceAreaCm = pieceLength * pieceWidth;
  const pieceAreaM2 = pieceAreaCm / 10000;
  
  if (pieceAreaM2 === 0) {
    return {
      error: { value: 'Dimensões da peça não podem ser zero', unit: '', category: 'info' }
    };
  }

  const adjustedArea = area * (1 + wasteFactor / 100);
  const piecesNeeded = Math.ceil(adjustedArea / pieceAreaM2);
  const boxes = Math.ceil(piecesNeeded / boxSize);
  
  const mortarKg = Math.ceil(area * MATERIAL_CONSTANTS.FLOORING.MORTAR_KG_PER_M2);
  const groutKg = Math.ceil(area * MATERIAL_CONSTANTS.FLOORING.GROUT_KG_PER_M2);

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    adjustedArea: { value: adjustedArea.toFixed(2), unit: 'm²', category: 'info' },
    pieceArea: { value: pieceAreaM2.toFixed(4), unit: 'm²/peça', category: 'info' },
    piecesNeeded: { value: piecesNeeded, unit: 'peças', highlight: true, category: 'primary' },
    boxes: { value: boxes, unit: 'caixas', highlight: true, category: 'primary' },
    mortarKg: { value: mortarKg, unit: 'kg', category: 'secondary' },
    groutKg: { value: groutKg, unit: 'kg', category: 'secondary' },
    wasteFactor: { value: wasteFactor, unit: '%', category: 'info' }
  };
};

export const flooringCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Piso e Revestimento',
  description: 'Cálculo de peças, argamassa e rejunte'
};
