
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
    placeholder: 'Ex: 6.0',
    helpText: 'Comprimento do ambiente',
    tooltip: 'Medida do comprimento em metros'
  },
  {
    key: 'width',
    label: 'Largura do Ambiente',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm',
    placeholder: 'Ex: 5.0',
    helpText: 'Largura do ambiente',
    tooltip: 'Medida da largura em metros'
  },
  {
    key: 'pieceLength',
    label: 'Comprimento da Peça',
    type: 'number',
    defaultValue: 60,
    min: 1,
    max: 200,
    unit: 'cm',
    placeholder: 'Ex: 60',
    tooltip: 'Comprimento individual da peça de revestimento'
  },
  {
    key: 'pieceWidth',
    label: 'Largura da Peça',
    type: 'number',
    defaultValue: 60,
    min: 1,
    max: 200,
    unit: 'cm',
    placeholder: 'Ex: 60',
    tooltip: 'Largura individual da peça de revestimento'
  },
  {
    key: 'wasteFactor',
    label: 'Fator de Perda',
    type: 'number',
    defaultValue: MATERIAL_CONSTANTS.FLOORING.DEFAULT_WASTE_FACTOR,
    min: 0,
    max: 50,
    unit: '%',
    placeholder: 'Ex: 10',
    tooltip: 'Percentual de perda durante a instalação'
  },
  {
    key: 'boxSize',
    label: 'Peças por Caixa',
    type: 'number',
    defaultValue: 10,
    min: 1,
    unit: 'peças',
    placeholder: 'Ex: 10',
    tooltip: 'Quantidade de peças por embalagem'
  },
  {
    key: 'installationType',
    label: 'Tipo de Instalação',
    type: 'select',
    required: true,
    placeholder: 'Selecione o tipo de instalação...',
    options: [
      { value: 'ceramic', label: 'Cerâmica/Porcelanato (argamassa colante)' },
      { value: 'stone', label: 'Pedra Natural (argamassa + impermeabilizante)' },
      { value: 'vinyl', label: 'Vinílico/Laminado (cola específica)' }
    ],
    helpText: 'CERÂMICA/PORCELANATO: Ideal para cozinhas, banheiros e áreas molhadas. Durável e fácil de limpar. PEDRA NATURAL: Para áreas sofisticadas, requer impermeabilização. VINÍLICO: Econômico, confortável, ideal para quartos e salas.',
    tooltip: 'Escolha conforme uso: áreas molhadas (cerâmica), alto padrão (pedra), conforto (vinílico)'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'length', required: true, min: 0.1 },
    { field: 'width', required: true, min: 0.1 },
    { field: 'pieceLength', required: true, min: 1 },
    { field: 'pieceWidth', required: true, min: 1 },
    { field: 'installationType', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const length = MaterialValidator.sanitizeNumericInput(inputs.length, 0.1);
  const width = MaterialValidator.sanitizeNumericInput(inputs.width, 0.1);
  const area = length * width;
  const pieceLength = MaterialValidator.sanitizeNumericInput(inputs.pieceLength, 1);
  const pieceWidth = MaterialValidator.sanitizeNumericInput(inputs.pieceWidth, 1);
  const wasteFactor = MaterialValidator.sanitizeNumericInput(inputs.wasteFactor, 0);
  const boxSize = MaterialValidator.sanitizeNumericInput(inputs.boxSize, 1);
  const installationType = inputs.installationType as string;

  // Cálculos básicos
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

  let result: MaterialResult = {
    // Informações básicas
    dimensions: { value: `${length.toFixed(2)} x ${width.toFixed(2)}`, unit: 'm', category: 'info' },
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    adjustedArea: { value: adjustedArea.toFixed(2), unit: 'm²', category: 'info' },
    pieceArea: { value: pieceAreaM2.toFixed(4), unit: 'm²/peça', category: 'info' },
    wasteFactor: { value: wasteFactor, unit: '%', category: 'info' },
    
    // Materiais principais
    piecesNeeded: { value: piecesNeeded, unit: 'peças', highlight: true, category: 'primary' },
    boxes: { value: boxes, unit: 'caixas', highlight: true, category: 'primary' }
  };

  // Materiais específicos por tipo de instalação
  if (installationType === 'ceramic') {
    // NBR 14081 - Argamassa colante
    const mortarKg = Math.ceil(area * 4); // 4kg/m² para pisos
    const groutKg = Math.ceil(area * 0.7); // 0.7kg/m² para rejunte
    const spacersKg = Math.ceil(area * 0.1); // Espaçadores plásticos
    const sealerL = Math.ceil(area * 0.05); // Impermeabilizante para áreas úmidas

    result = {
      ...result,
      mortarKg: { value: mortarKg, unit: 'kg', highlight: true, category: 'primary' },
      groutKg: { value: groutKg, unit: 'kg', highlight: true, category: 'primary' },
      spacersKg: { value: spacersKg, unit: 'kg', category: 'secondary' },
      sealerL: { value: sealerL, unit: 'L', category: 'secondary' },
      mortarType: { value: 'AC-II ou AC-III conforme NBR 14081', unit: '', category: 'info' }
    };
  } else if (installationType === 'stone') {
    // Pedra natural - argamassa específica
    const mortarKg = Math.ceil(area * 6); // 6kg/m² para pedras
    const groutKg = Math.ceil(area * 1); // 1kg/m² para rejunte de pedra
    const sealerL = Math.ceil(area * 0.15); // Impermeabilizante obrigatório
    const cleanerL = Math.ceil(area * 0.05); // Produto de limpeza pós-obra

    result = {
      ...result,
      mortarKg: { value: mortarKg, unit: 'kg', highlight: true, category: 'primary' },
      groutKg: { value: groutKg, unit: 'kg', highlight: true, category: 'primary' },
      sealerL: { value: sealerL, unit: 'L', highlight: true, category: 'primary' },
      cleanerL: { value: cleanerL, unit: 'L', category: 'secondary' },
      mortarType: { value: 'Argamassa específica para pedra natural', unit: '', category: 'info' }
    };
  } else if (installationType === 'vinyl') {
    // Piso vinílico/laminado
    const adhesiveKg = Math.ceil(area * 0.3); // 300g/m² de cola
    const underlaymentM2 = Math.ceil(area * 1.05); // Manta acústica
    const transitionBarsM = Math.ceil(area * 0.1); // Barras de transição

    result = {
      ...result,
      adhesiveKg: { value: adhesiveKg, unit: 'kg', highlight: true, category: 'primary' },
      underlaymentM2: { value: underlaymentM2, unit: 'm²', category: 'secondary' },
      transitionBarsM: { value: transitionBarsM, unit: 'm lineares', category: 'secondary' },
      adhesiveType: { value: 'Cola específica para piso vinílico', unit: '', category: 'info' }
    };
  }

  return result;
};

export const flooringCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Piso e Revestimento',
  description: 'Cálculo completo de revestimentos, argamassa colante, rejunte e materiais auxiliares conforme ABNT'
};
