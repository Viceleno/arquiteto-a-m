
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'length',
    label: 'Comprimento do Telhado',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm',
    placeholder: 'Ex: 10.0',
    helpText: 'Comprimento do telhado',
    tooltip: 'Medida do comprimento incluindo beirais'
  },
  {
    key: 'width',
    label: 'Largura do Telhado',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm',
    placeholder: 'Ex: 8.0',
    helpText: 'Largura do telhado',
    tooltip: 'Medida da largura incluindo beirais'
  },
  {
    key: 'tileType',
    label: 'Tipo de Telha',
    type: 'select',
    required: true,
    placeholder: 'Selecione o tipo de telha...',
    options: [
      { value: 'ceramic', label: 'Cerâmica (16 telhas/m²)' },
      { value: 'concrete', label: 'Concreto (10,5 telhas/m²)' },
      { value: 'fiber', label: 'Fibrocimento (5,1 telhas/m²)' },
      { value: 'metal', label: 'Metálica (4 telhas/m²)' }
    ],
    helpText: 'CERÂMICA: Tradicional, bonita, precisa estrutura de madeira robusta. CONCRETO: Mais durável que cerâmica, pesada. FIBROCIMENTO: Econômica, galpões, esquenta mais. METÁLICA: Leve, rápida, moderna, ideal para grandes vãos.',
    tooltip: 'Escolha por: estética e tradição (cerâmica), economia (fibro), rapidez e leveza (metálica)'
  },
  {
    key: 'slope',
    label: 'Inclinação do Telhado',
    type: 'number',
    min: 5,
    max: 100,
    unit: '%',
    placeholder: 'Ex: 30',
    helpText: 'Inclinação recomendada: 25-35% para telhas cerâmicas',
    tooltip: 'Inclinação do telhado em percentual - afeta estrutura e drenagem'
  },
  {
    key: 'ridgeLength',
    label: 'Comprimento da Cumeeira',
    type: 'number',
    min: 0,
    unit: 'm',
    placeholder: 'Ex: 15.0',
    helpText: 'Comprimento total das cumeeiras e espigões',
    tooltip: 'Metros lineares de cumeeira para cálculo de peças especiais'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'length', required: true, min: 0.1 },
    { field: 'width', required: true, min: 0.1 },
    { field: 'tileType', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const length = MaterialValidator.sanitizeNumericInput(inputs.length, 0.1);
  const width = MaterialValidator.sanitizeNumericInput(inputs.width, 0.1);
  const area = length * width;
  const tileType = inputs.tileType as keyof typeof MATERIAL_CONSTANTS.ROOFING.TILE_TYPES;
  const slope = MaterialValidator.sanitizeNumericInput(inputs.slope, 30);
  const ridgeLength = MaterialValidator.sanitizeNumericInput(inputs.ridgeLength, 0);

  const tileData = MATERIAL_CONSTANTS.ROOFING.TILE_TYPES[tileType];
  
  if (!tileData) {
    return {
      error: { value: 'Tipo de telha não encontrado', unit: '', category: 'info' }
    };
  }

  const adjustedArea = area * (1 + MATERIAL_CONSTANTS.ROOFING.WASTE_FACTOR);
  const tilesNeeded = Math.ceil(adjustedArea * tileData.tilesPerM2);
  
  // Cumeeiras baseadas no tipo de telha
  let ridgeTiles = 0;
  if (ridgeLength > 0) {
    const ridgePerMeter = tileType === 'ceramic' ? 3 : tileType === 'concrete' ? 2.5 : 2;
    ridgeTiles = Math.ceil(ridgeLength * ridgePerMeter);
  } else {
    ridgeTiles = Math.ceil(area * 0.05); // Estimativa: 5% da área
  }

  let result: MaterialResult = {
    // Informações básicas
    dimensions: { value: `${length.toFixed(2)} x ${width.toFixed(2)}`, unit: 'm', category: 'info' },
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    adjustedArea: { value: adjustedArea.toFixed(2), unit: 'm²', category: 'info' },
    slope: { value: slope, unit: '%', category: 'info' },
    tileType: { value: tileType, unit: '', category: 'info' },
    
    // Materiais principais
    tilesNeeded: { value: tilesNeeded, unit: 'telhas', highlight: true, category: 'primary' },
    ridgeTiles: { value: ridgeTiles, unit: 'cumeeiras', highlight: true, category: 'primary' }
  };

  // Materiais específicos por tipo de telha
  if (tileType === 'ceramic' || tileType === 'concrete') {
    // Estrutura de madeira para telhas cerâmicas/concreto
    const raftersM = Math.ceil(area * 1.2); // 1.2m lineares de caibros por m²
    const tilesM = Math.ceil(area * 2.5); // 2.5m lineares de ripas por m²
    const ridgeBeamM = ridgeLength; // viga de cumeeira
    const nailsKg = Math.ceil(area * 0.3); // 300g de pregos por m²
    const wireM = Math.ceil(tilesNeeded * 0.5); // arame galvanizado para amarração

    result = {
      ...result,
      raftersM: { value: raftersM, unit: 'm caibros 5x6cm', highlight: true, category: 'primary' },
      tilesM: { value: tilesM, unit: 'm ripas 2x5cm', highlight: true, category: 'primary' },
      ridgeBeamM: { value: ridgeBeamM, unit: 'm viga 6x12cm', category: 'secondary' },
      nailsKg: { value: nailsKg, unit: 'kg pregos', category: 'secondary' },
      wireM: { value: wireM, unit: 'm arame galv', category: 'secondary' }
    };
  } else if (tileType === 'fiber') {
    // Estrutura para fibrocimento
    const purlinM = Math.ceil(area * 0.8); // terças metálicas
    const boltsUn = Math.ceil(tilesNeeded * 2); // parafusos para fixação
    const washersUn = boltsUn * 2; // arruelas de vedação
    const sealantTubes = Math.ceil(area * 0.1); // vedante para sobreposições

    result = {
      ...result,
      purlinM: { value: purlinM, unit: 'm terças metálicas', highlight: true, category: 'primary' },
      boltsUn: { value: boltsUn, unit: 'parafusos', category: 'secondary' },
      washersUn: { value: washersUn, unit: 'arruelas', category: 'secondary' },
      sealantTubes: { value: sealantTubes, unit: 'tubos vedante', category: 'secondary' }
    };
  } else if (tileType === 'metal') {
    // Estrutura para telhas metálicas
    const purlinM = Math.ceil(area * 0.6); // estrutura metálica reduzida
    const screwsUn = Math.ceil(tilesNeeded * 8); // parafusos autobrocantes
    const washersUn = screwsUn; // arruelas EPDM
    const flashingM = Math.ceil(ridgeLength * 1.1); // rufos e calhas
    const insulationM2 = Math.ceil(area * 0.9); // manta térmica opcional

    result = {
      ...result,
      purlinM: { value: purlinM, unit: 'm perfis metálicos', highlight: true, category: 'primary' },
      screwsUn: { value: screwsUn, unit: 'parafusos autobroc', category: 'secondary' },
      washersUn: { value: washersUn, unit: 'arruelas EPDM', category: 'secondary' },
      flashingM: { value: flashingM, unit: 'm rufos/calhas', category: 'secondary' },
      insulationM2: { value: insulationM2, unit: 'm² manta térmica', category: 'secondary' }
    };
  }

  // Materiais auxiliares gerais
  const gutterM = Math.ceil(area * 0.3); // calhas para drenagem
  const downspoutM = Math.ceil(area * 0.1); // condutores verticais
  const membraneM2 = Math.ceil(area * 1.05); // manta asfáltica sub-cobertura

  result = {
    ...result,
    // Sistema de drenagem
    gutterM: { value: gutterM, unit: 'm calhas', category: 'secondary' },
    downspoutM: { value: downspoutM, unit: 'm condutores', category: 'secondary' },
    membraneM2: { value: membraneM2, unit: 'm² manta asfáltica', category: 'secondary' }
  };

  return result;
};

export const roofingCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Cobertura',
  description: 'Cálculo completo de telhas, estrutura, fixações e sistema de drenagem conforme NBR 15575'
};
