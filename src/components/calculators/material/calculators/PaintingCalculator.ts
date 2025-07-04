
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MATERIAL_CONSTANTS } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'wallArea',
    label: 'Área das Paredes',
    type: 'number',
    required: true,
    min: 1,
    unit: 'm²',
    placeholder: 'Ex: 120.0',
    helpText: 'Área total das paredes a serem pintadas',
    tooltip: 'Área total das paredes em metros quadrados'
  },
  {
    key: 'openings',
    label: 'Área de Vãos',
    type: 'number',
    defaultValue: 0,
    min: 0,
    unit: 'm²',
    placeholder: 'Ex: 15.0',
    helpText: 'Área de portas e janelas (será descontada)',
    tooltip: 'Área total de portas e janelas que não receberão tinta'
  },
  {
    key: 'surfaceType',
    label: 'Tipo de Superfície',
    type: 'select',
    required: true,
    placeholder: 'Selecione o tipo de superfície...',
    options: [
      { value: 'smooth', label: 'Lisa (massa corrida/gesso)' },
      { value: 'textured', label: 'Texturizada/Grafiato' },
      { value: 'concrete', label: 'Concreto aparente' },
      { value: 'wood', label: 'Madeira' },
      { value: 'metal', label: 'Metal/Ferro' }
    ],
    tooltip: 'Tipo de superfície afeta o consumo de tinta e preparação'
  },
  {
    key: 'paintType',
    label: 'Tipo de Tinta',
    type: 'select',
    required: true,
    placeholder: 'Selecione o tipo de tinta...',
    options: [
      { value: 'acrylic', label: 'Acrílica (interior)' },
      { value: 'acrylic_external', label: 'Acrílica (exterior)' },
      { value: 'latex', label: 'Látex PVA' },
      { value: 'enamel', label: 'Esmalte sintético' },
      { value: 'epoxy', label: 'Tinta epóxi' }
    ],
    tooltip: 'Cada tipo de tinta tem rendimento e aplicação específicos'
  },
  {
    key: 'coats',
    label: 'Número de Demãos',
    type: 'number',
    defaultValue: 2,
    min: 1,
    max: 4,
    required: true,
    unit: 'demãos',
    placeholder: 'Ex: 2',
    tooltip: 'Quantidade de demãos de tinta'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'wallArea', required: true, min: 1 },
    { field: 'surfaceType', required: true },
    { field: 'paintType', required: true },
    { field: 'coats', required: true, min: 1, max: 4 }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const wallArea = MaterialValidator.sanitizeNumericInput(inputs.wallArea, 1);
  const openings = MaterialValidator.sanitizeNumericInput(inputs.openings);
  const coats = MaterialValidator.sanitizeNumericInput(inputs.coats || 2, 1);
  const surfaceType = inputs.surfaceType as string;
  const paintType = inputs.paintType as string;

  const paintableArea = Math.max(0, wallArea - openings);

  // Definir rendimento baseado no tipo de tinta e superfície
  let coverage = 12; // m²/L padrão
  let requiresSealer = false;
  let requiresFiller = false;

  switch (paintType) {
    case 'acrylic':
      coverage = surfaceType === 'textured' ? 8 : 12;
      requiresSealer = true;
      requiresFiller = surfaceType === 'concrete';
      break;
    case 'acrylic_external':
      coverage = surfaceType === 'textured' ? 6 : 10;
      requiresSealer = true;
      requiresFiller = true;
      break;
    case 'latex':
      coverage = surfaceType === 'textured' ? 10 : 14;
      requiresSealer = true;
      break;
    case 'enamel':
      coverage = surfaceType === 'metal' ? 8 : 12;
      requiresSealer = surfaceType === 'metal';
      break;
    case 'epoxy':
      coverage = 6;
      requiresSealer = false;
      break;
  }

  // Cálculo da tinta
  const paintNeeded = (paintableArea * coats) / coverage;
  
  // Conversões para embalagens
  const cans18L = Math.ceil(paintNeeded / 18);
  const gallons36L = Math.ceil(paintNeeded / 3.6);
  
  let result: MaterialResult = {
    // Informações básicas
    paintableArea: { value: paintableArea.toFixed(2), unit: 'm²', category: 'info' },
    coats: { value: coats, unit: 'demãos', category: 'info' },
    coverage: { value: coverage, unit: 'm²/L', category: 'info' },
    surfaceType: { value: surfaceType, unit: '', category: 'info' },
    
    // Materiais principais
    paintNeeded: { value: paintNeeded.toFixed(2), unit: 'L', highlight: true, category: 'primary' },
    cans18L: { value: cans18L, unit: 'latas 18L', highlight: true, category: 'primary' },
    gallons36L: { value: gallons36L, unit: 'galões 3,6L', category: 'secondary' }
  };

  // Materiais auxiliares baseados na superfície e tipo de tinta
  if (requiresSealer) {
    const sealerNeeded = paintableArea / 10; // 10 m²/L para selador
    const sealerCans = Math.ceil(sealerNeeded / 3.6);
    
    result = {
      ...result,
      sealerNeeded: { value: sealerNeeded.toFixed(2), unit: 'L', highlight: true, category: 'primary' },
      sealerCans: { value: sealerCans, unit: 'galões 3,6L', category: 'secondary' }
    };
  }

  if (requiresFiller) {
    const fillerNeeded = paintableArea * 0.5; // 0.5 kg/m² de massa corrida
    const fillerBags = Math.ceil(fillerNeeded / 20); // sacos de 20kg
    
    result = {
      ...result,
      fillerNeeded: { value: fillerNeeded.toFixed(1), unit: 'kg', highlight: true, category: 'primary' },
      fillerBags: { value: fillerBags, unit: 'sacos 20kg', category: 'secondary' }
    };
  }

  // Materiais auxiliares gerais
  const sandpaperM2 = Math.ceil(paintableArea * 0.5); // Lixa para preparação
  const brushes = Math.ceil(paintableArea / 50); // 1 pincel para cada 50m²
  const rollers = Math.ceil(paintableArea / 30); // 1 rolo para cada 30m²
  const plasticM2 = Math.ceil(paintableArea * 1.2); // Lona plástica para proteção

  result = {
    ...result,
    // Materiais de preparação e aplicação
    sandpaperM2: { value: sandpaperM2, unit: 'm² lixa', category: 'secondary' },
    brushes: { value: brushes, unit: 'pincéis', category: 'secondary' },
    rollers: { value: rollers, unit: 'rolos', category: 'secondary' },
    plasticM2: { value: plasticM2, unit: 'm² lona', category: 'secondary' }
  };

  return result;
};

export const paintingCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Pintura',
  description: 'Cálculo completo de tinta, selador, massa corrida e materiais de preparação conforme NBR 15079'
};
