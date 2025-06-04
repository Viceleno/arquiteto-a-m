
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área (m²)',
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
    tooltip: 'Comprimento da peça cerâmica/porcelanato'
  },
  {
    key: 'pieceWidth',
    label: 'Largura da Peça (cm)',
    type: 'number',
    defaultValue: 60,
    min: 1,
    tooltip: 'Largura da peça cerâmica/porcelanato'
  },
  {
    key: 'groutWidth',
    label: 'Largura do Rejunte (mm)',
    type: 'number',
    defaultValue: 2,
    min: 1,
    max: 20,
    tooltip: 'Largura da junta de rejunte'
  },
  {
    key: 'wasteFactor',
    label: 'Fator de Perda (%)',
    type: 'number',
    defaultValue: MATERIAL_CONSTANTS.FLOORING.DEFAULT_WASTE_FACTOR,
    min: 5,
    max: 30,
    tooltip: 'Porcentagem de perda por quebras e recortes'
  },
  {
    key: 'boxSize',
    label: 'Peças por Caixa',
    type: 'number',
    defaultValue: 10,
    min: 1,
    tooltip: 'Quantidade de peças por caixa do produto'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'pieceLength', required: true, min: 1 },
    { field: 'pieceWidth', required: true, min: 1 },
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area);
  const pieceLength = MaterialValidator.sanitizeNumericInput(inputs.pieceLength, 1);
  const pieceWidth = MaterialValidator.sanitizeNumericInput(inputs.pieceWidth, 1);
  const groutWidth = MaterialValidator.sanitizeNumericInput(inputs.groutWidth, 1);
  const wasteFactor = MaterialValidator.sanitizeNumericInput(inputs.wasteFactor, 5);
  const boxSize = MaterialValidator.sanitizeNumericInput(inputs.boxSize, 1);

  // Cálculo da área da peça em m²
  const pieceArea = (pieceLength * pieceWidth) / 10000; // cm² para m²
  
  // Cálculo das peças considerando perda
  const totalAreaWithWaste = area * (1 + wasteFactor / 100);
  const piecesNeeded = Math.ceil(totalAreaWithWaste / pieceArea);
  const boxes = Math.ceil(piecesNeeded / boxSize);

  // Cálculo de argamassa colante (kg/m²)
  const mortarKg = Math.ceil(area * MATERIAL_CONSTANTS.FLOORING.MORTAR_KG_PER_M2);

  // Cálculo de rejunte considerando as juntas
  const groutVolume = (area * groutWidth * 3) / 1000; // Aproximação do volume de rejunte
  const groutKg = Math.ceil(groutVolume * 1.8); // Densidade média do rejunte

  return {
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    piecesNeeded: { value: piecesNeeded, unit: 'unidades', highlight: true, category: 'primary' },
    boxes: { value: boxes, unit: 'caixas', highlight: true, category: 'primary' },
    mortarKg: { value: mortarKg, unit: 'kg', category: 'secondary' },
    groutKg: { value: groutKg, unit: 'kg', category: 'secondary' },
    wasteFactor: { value: wasteFactor + '%', category: 'info' },
    pieceArea: { value: pieceArea.toFixed(4), unit: 'm²/peça', category: 'info' }
  };
};

export const flooringCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Pisos e Revestimentos',
  description: 'Cálculo de peças, argamassa e rejunte'
};
