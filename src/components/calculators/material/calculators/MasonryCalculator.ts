
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
    defaultValue: 1.5,
    placeholder: 'Ex: 1.5',
    helpText: 'Espessura típica: 1-2cm para juntas regulares',
    tooltip: 'Espessura da junta de argamassa entre os tijolos'
  },
  {
    key: 'includeRender',
    label: 'Incluir Reboco',
    type: 'select',
    required: true,
    placeholder: 'Selecione se deseja incluir reboco...',
    options: [
      { value: 'yes', label: 'Sim - Incluir reboco' },
      { value: 'no', label: 'Não - Apenas assentamento' }
    ],
    tooltip: 'Reboco é o revestimento aplicado sobre a alvenaria'
  },
  {
    key: 'renderThickness',
    label: 'Espessura do Reboco',
    type: 'number',
    min: 1.0,
    max: 3.0,
    unit: 'cm',
    defaultValue: 2.0,
    placeholder: 'Ex: 2.0',
    helpText: 'Espessura típica: 1.5-2.5cm conforme ABNT NBR 13749',
    tooltip: 'Espessura do reboco conforme ABNT NBR 13749'
  },
  {
    key: 'faces',
    label: 'Número de Faces',
    type: 'select',
    required: true,
    defaultValue: 'two',
    options: [
      { value: 'one', label: '1 face (parede externa ou muro)' },
      { value: 'two', label: '2 faces (parede interna)' }
    ],
    tooltip: 'Quantidade de faces da parede que receberão reboco'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'brickType', required: true },
    { field: 'includeRender', required: true },
    { field: 'faces', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const brickType = inputs.brickType as keyof typeof MATERIAL_CONSTANTS.MASONRY.BRICK_TYPES;
  const mortarThickness = MaterialValidator.sanitizeNumericInput(inputs.mortarThickness, 1.5);
  const includeRender = inputs.includeRender as string;
  const renderThickness = MaterialValidator.sanitizeNumericInput(inputs.renderThickness, 2.0);
  const faces = inputs.faces as string;

  // Aplicar fator de perdas de 5% para alvenaria (NBR 15270)
  const adjustedArea = area * 1.05;

  const brickData = MATERIAL_CONSTANTS.MASONRY.BRICK_TYPES[brickType];
  
  if (!brickData) {
    return {
      error: { value: 'Tipo de tijolo não encontrado', unit: '', category: 'info' }
    };
  }

  // Cálculo de tijolos com perdas
  const bricksNeeded = Math.ceil(adjustedArea * brickData.bricksPerM2);

  // Cálculo da argamassa de assentamento (NBR 8545)
  // Volume = área × espessura da junta (com perdas)
  const mortarVolumeM3 = adjustedArea * (mortarThickness / 100);
  
  // Traço 1:3 (cimento:areia) para assentamento - NBR 8545
  // Para 1m³ de argamassa: 310kg cimento + 1.100kg areia + 195L água
  const cementLayingKg = Math.ceil(mortarVolumeM3 * 310);
  const sandLayingKg = Math.ceil(mortarVolumeM3 * 1100);
  const waterLayingL = Math.ceil(mortarVolumeM3 * 195);

  let result: MaterialResult = {
    // Informações básicas
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    adjustedArea: { value: adjustedArea.toFixed(2), unit: 'm² (com perdas)', category: 'info' },
    brickType: { value: `${brickData.width}x${brickData.height}x${brickData.length}cm`, unit: '', category: 'info' },
    
    // Materiais principais
    bricksNeeded: { value: bricksNeeded, unit: 'tijolos', highlight: true, category: 'primary' },
    
    // Argamassa de assentamento
    mortarVolumeM3: { value: mortarVolumeM3.toFixed(3), unit: 'm³', category: 'secondary' },
    cementLayingKg: { value: cementLayingKg, unit: 'kg', highlight: true, category: 'primary' },
    sandLayingKg: { value: sandLayingKg, unit: 'kg', highlight: true, category: 'primary' },
    waterLayingL: { value: waterLayingL, unit: 'L', category: 'secondary' },
    
    // Informações técnicas
    layingRatio: { value: '1:3 (cimento:areia)', unit: '', category: 'info' },
    mortarThickness: { value: mortarThickness.toFixed(1), unit: 'cm', category: 'info' }
  };

  // Cálculo do reboco se necessário
  if (includeRender === 'yes') {
    const facesMultiplier = faces === 'one' ? 1 : 2;
    const renderArea = adjustedArea * facesMultiplier;
    
    // Volume do reboco
    const renderVolumeM3 = renderArea * (renderThickness / 100);
    
    // Traço 1:2:8 (cimento:cal:areia) para reboco - NBR 13749
    // Para 1m³: 167kg cimento + 83kg cal + 1.200kg areia + 195L água
    const cementRenderKg = Math.ceil(renderVolumeM3 * 167);
    const limeRenderKg = Math.ceil(renderVolumeM3 * 83);
    const sandRenderKg = Math.ceil(renderVolumeM3 * 1200);
    const waterRenderL = Math.ceil(renderVolumeM3 * 195);
    
    // Totais consolidados
    const totalCementKg = cementLayingKg + cementRenderKg;
    const totalSandKg = sandLayingKg + sandRenderKg;
    const totalWaterL = waterLayingL + waterRenderL;

    result = {
      ...result,
      
      // Reboco
      renderArea: { value: renderArea.toFixed(2), unit: 'm²', category: 'info' },
      renderVolumeM3: { value: renderVolumeM3.toFixed(3), unit: 'm³', category: 'secondary' },
      renderThickness: { value: renderThickness.toFixed(1), unit: 'cm', category: 'info' },
      faces: { value: facesMultiplier === 2 ? '2 faces' : '1 face', unit: '', category: 'info' },
      
      cementRenderKg: { value: cementRenderKg, unit: 'kg', category: 'primary' },
      limeRenderKg: { value: limeRenderKg, unit: 'kg', highlight: true, category: 'primary' },
      sandRenderKg: { value: sandRenderKg, unit: 'kg', category: 'primary' },
      waterRenderL: { value: waterRenderL, unit: 'L', category: 'secondary' },
      
      renderRatio: { value: '1:2:8 (cimento:cal:areia)', unit: '', category: 'info' },
      
      // Totais consolidados
      totalCementKg: { value: totalCementKg, unit: 'kg', highlight: true, category: 'primary' },
      totalSandKg: { value: totalSandKg, unit: 'kg', highlight: true, category: 'primary' },
      totalWaterL: { value: totalWaterL, unit: 'L', category: 'secondary' }
    };
  }

  return result;
};

export const masonryCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Alvenaria',
  description: 'Cálculo completo de tijolos, argamassa de assentamento e reboco conforme ABNT'
};
