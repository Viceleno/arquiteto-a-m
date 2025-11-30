
import { MaterialInput, MaterialResult, CalculationConfig } from '../MaterialCalculatorTypes';
import { MaterialValidator } from '../MaterialValidation';

const inputs: MaterialInput[] = [
  {
    key: 'area',
    label: 'Área a Concretar',
    type: 'number',
    required: true,
    min: 0.1,
    unit: 'm²',
    placeholder: 'Ex: 100.0',
    helpText: 'Informe a área total que receberá o concreto',
    tooltip: 'Área em metros quadrados que será concretada'
  },
  {
    key: 'thickness',
    label: 'Espessura da Laje',
    type: 'number',
    required: true,
    min: 5,
    max: 50,
    unit: 'cm',
    placeholder: 'Ex: 15',
    helpText: 'Espessura típica: 12-20cm para lajes residenciais',
    tooltip: 'Espessura da laje de concreto em centímetros'
  },
  {
    key: 'concreteType',
    label: 'Resistência do Concreto',
    type: 'select',
    required: true,
    placeholder: 'Selecione a resistência...',
    options: [
      { value: 'fck20', label: 'FCK 20 MPa (uso residencial leve)' },
      { value: 'fck25', label: 'FCK 25 MPa (uso residencial/comercial)' },
      { value: 'fck30', label: 'FCK 30 MPa (uso estrutural pesado)' }
    ],
    tooltip: 'FCK é a resistência característica do concreto à compressão aos 28 dias'
  },
  {
    key: 'slumpType',
    label: 'Consistência (Slump)',
    type: 'select',
    required: true,
    placeholder: 'Selecione a consistência...',
    options: [
      { value: 'low', label: '5-9 cm (lajes e vigas)' },
      { value: 'medium', label: '10-15 cm (pilares e estruturas)' },
      { value: 'high', label: '16-20 cm (bombeamento)' }
    ],
    tooltip: 'Slump test define a trabalhabilidade do concreto conforme NBR NM 67'
  },
  {
    key: 'sandHumidity',
    label: 'Umidade da Areia',
    type: 'select',
    required: true,
    placeholder: 'Selecione a umidade...',
    options: [
      { value: 'dry', label: 'Seca (0% - areia estocada coberta)' },
      { value: 'humid', label: 'Úmida (5% - areia exposta)' },
      { value: 'wet', label: 'Molhada (10% - após chuva)' }
    ],
    tooltip: 'A umidade da areia afeta o inchamento e a quantidade de água na mistura (NBR 9775)'
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'thickness', required: true, min: 5 },
    { field: 'concreteType', required: true },
    { field: 'slumpType', required: true },
    { field: 'sandHumidity', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const thickness = MaterialValidator.sanitizeNumericInput(inputs.thickness, 10);
  const concreteType = inputs.concreteType as string;
  const slumpType = inputs.slumpType as string;
  const sandHumidity = inputs.sandHumidity as string;
  
  const volume = area * (thickness / 100); // m³
  const concreteNeeded = volume * 1.05; // 5% de perda

  // Traços conforme ABNT NBR 6118 e NBR 12655
  let cementKg = 0;
  let baseSandM3 = 0;
  let gravelM3 = 0;
  let baseWaterL = 0;
  let ratio = '';

  switch (concreteType) {
    case 'fck20':
      // Traço 1:2.5:3.5 (cimento:areia:brita)
      cementKg = Math.ceil(concreteNeeded * 280); // 280 kg/m³
      baseSandM3 = concreteNeeded * 0.7;
      gravelM3 = concreteNeeded * 0.98;
      baseWaterL = concreteNeeded * 168; // fator a/c = 0.6
      ratio = '1 : 2,5 : 3,5 (cimento:areia:brita)';
      break;
    case 'fck25':
      // Traço 1:2:3 (cimento:areia:brita)
      cementKg = Math.ceil(concreteNeeded * 350); // 350 kg/m³
      baseSandM3 = concreteNeeded * 0.7;
      gravelM3 = concreteNeeded * 1.05;
      baseWaterL = concreteNeeded * 175; // fator a/c = 0.5
      ratio = '1 : 2 : 3 (cimento:areia:brita)';
      break;
    case 'fck30':
      // Traço 1:1.5:2.5 (cimento:areia:brita)
      cementKg = Math.ceil(concreteNeeded * 420); // 420 kg/m³
      baseSandM3 = concreteNeeded * 0.63;
      gravelM3 = concreteNeeded * 1.05;
      baseWaterL = concreteNeeded * 168; // fator a/c = 0.4
      ratio = '1 : 1,5 : 2,5 (cimento:areia:brita)';
      break;
  }

  // Ajuste de areia baseado na umidade (NBR 9775 - Inchamento da areia)
  // Areia úmida/molhada incha até 25-30%, precisamos compensar
  let sandSwellingFactor = 1.0;
  let sandHumidityPercent = 0;
  let waterReductionFromSand = 0;
  let sandHumidityLabel = '';
  
  switch (sandHumidity) {
    case 'dry':
      sandSwellingFactor = 1.0;
      sandHumidityPercent = 0;
      sandHumidityLabel = 'Seca (0%)';
      break;
    case 'humid':
      sandSwellingFactor = 1.25; // 25% de inchamento
      sandHumidityPercent = 5;
      sandHumidityLabel = 'Úmida (5%)';
      // Água contida na areia: 5% do peso da areia (densidade ~1.5 t/m³)
      waterReductionFromSand = baseSandM3 * 1500 * 0.05; // litros
      break;
    case 'wet':
      sandSwellingFactor = 1.25; // 25% de inchamento (máximo)
      sandHumidityPercent = 10;
      sandHumidityLabel = 'Molhada (10%)';
      // Água contida na areia: 10% do peso da areia
      waterReductionFromSand = baseSandM3 * 1500 * 0.10; // litros
      break;
  }

  // Volume de areia ajustado pelo inchamento
  const sandM3 = baseSandM3 * sandSwellingFactor;
  
  // Conversões
  const cementBags = Math.ceil(cementKg / 50); // sacos de 50kg
  const sandTons = (sandM3 * 1.5).toFixed(2); // densidade ~1.5 t/m³
  const gravelTons = (gravelM3 * 1.6).toFixed(2); // densidade ~1.6 t/m³

  // Ajuste de água baseado no slump
  let waterAdjustment = 1;
  switch (slumpType) {
    case 'low': waterAdjustment = 0.95; break;
    case 'medium': waterAdjustment = 1.0; break;
    case 'high': waterAdjustment = 1.1; break;
  }
  
  // Água final = base ajustada pelo slump - água da areia úmida
  let waterL = Math.ceil(Math.max(0, (baseWaterL * waterAdjustment) - waterReductionFromSand));

  // Armadura estimada conforme NBR 6118 com perdas variáveis
  // Taxa base de aço para lajes: 80-100 kg/m³ dependendo da espessura
  let steelRateKgM3 = 80; // kg/m³ base para lajes finas
  if (thickness >= 15) steelRateKgM3 = 90;
  if (thickness >= 20) steelRateKgM3 = 100;
  
  // Fator de perda baseado na espessura (aproveitamento de barras)
  // Lajes finas (<10cm): 10% de perda - cortes menores, mais desperdício
  // Lajes espessas (>=10cm): 7% de perda - melhor aproveitamento
  const steelLossFactor = thickness < 10 ? 1.10 : 1.07;
  
  const steelKgBase = volume * steelRateKgM3;
  const steelKg = Math.ceil(steelKgBase * steelLossFactor);
  const steelBars = Math.ceil(steelKg / 8.5); // barras de 12mm de 12m ≈ 8.5kg
  const steelLossPercent = thickness < 10 ? '10%' : '7%';

  // Materiais auxiliares
  const wireKg = Math.ceil(steelKg * 0.02); // 2% do peso do aço em arame recozido
  const spacersUn = Math.ceil(area * 4); // 4 espaçadores por m²
  const plasticsM2 = Math.ceil(area * 1.1); // lona plástica para cura
  const curingCompoundL = Math.ceil(area * 0.2); // composto de cura

  // Alertas de compatibilidade FCK x Espessura
  const alerts: string[] = [];
  
  // FCK 20 não é recomendado para lajes estruturais espessas
  if (concreteType === 'fck20' && thickness >= 15) {
    alerts.push('⚠️ FCK 20 MPa pode ser insuficiente para lajes com espessura ≥15cm. Considere FCK 25 ou superior para maior segurança estrutural.');
  }
  
  // FCK 20 com grande área (grande vão)
  if (concreteType === 'fck20' && area >= 50) {
    alerts.push('⚠️ FCK 20 MPa não é recomendado para lajes de grande vão (área ≥50m²). Use FCK 25 ou FCK 30 para evitar fissuras e deformações excessivas.');
  }
  
  // Espessura muito fina para FCK alto (desperdício)
  if (concreteType === 'fck30' && thickness <= 8) {
    alerts.push('💡 FCK 30 MPa pode ser superdimensionado para lajes finas (≤8cm). Considere FCK 25 para otimizar custos sem comprometer a segurança.');
  }
  
  // Laje muito fina em geral
  if (thickness < 8) {
    alerts.push('⚠️ Lajes com espessura inferior a 8cm podem apresentar problemas de fissuração. Espessura mínima recomendada: 8-10cm para lajes residenciais.');
  }

  const result: MaterialResult = {
    // Informações básicas do projeto
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    thickness: { value: thickness, unit: 'cm', category: 'info' },
    volume: { value: volume.toFixed(2), unit: 'm³', category: 'info' },
    
    // Especificações técnicas NBR 6118
    concreteType: { value: concreteType.toUpperCase(), unit: '', category: 'info' },
    slumpType: { value: slumpType, unit: '', category: 'info' },
    sandHumidityInfo: { value: sandHumidityLabel, unit: '', category: 'info' },
    
    // Traço de concreto (proporção em massa)
    ratio: { value: ratio, unit: '', category: 'info' },
    concreteNeeded: { value: concreteNeeded.toFixed(2), unit: 'm³ concreto', highlight: true, category: 'primary' },
    
    // Cimento Portland (NBR 12655)
    cementKg: { value: cementKg, unit: 'kg cimento', highlight: true, category: 'primary' },
    cementBags: { value: cementBags, unit: 'sacos 50kg', highlight: true, category: 'primary' },
    
    // Agregado Miúdo - Areia (com compensação de inchamento)
    sandM3: { value: sandM3.toFixed(2), unit: 'm³ areia média', highlight: true, category: 'primary' },
    sandTons: { value: sandTons, unit: 't areia', category: 'secondary' },
    
    // Agregado Graúdo - Brita
    gravelM3: { value: gravelM3.toFixed(2), unit: 'm³ brita 1', highlight: true, category: 'primary' },
    gravelTons: { value: gravelTons, unit: 't brita', category: 'secondary' },
    
    // Água de amassamento (ajustada pela umidade da areia)
    waterL: { value: waterL, unit: 'L água', highlight: true, category: 'primary' },
    
    // Armadura CA-50 (NBR 6118) com perda variável
    steelKg: { value: steelKg, unit: 'kg aço CA-50', highlight: true, category: 'primary' },
    steelBars: { value: steelBars, unit: 'barras Ø12mm x 12m', category: 'secondary' },
    steelLoss: { value: steelLossPercent, unit: 'perda estimada', category: 'info' },
    
    // Materiais auxiliares
    wireKg: { value: wireKg, unit: 'kg arame recozido', category: 'secondary' },
    spacersUn: { value: spacersUn, unit: 'espaçadores plásticos', category: 'secondary' },
    plasticsM2: { value: plasticsM2, unit: 'm² lona para cura', category: 'secondary' },
    curingCompoundL: { value: curingCompoundL, unit: 'L composto de cura', category: 'secondary' }
  };

  // Adiciona alertas ao resultado se houver
  if (alerts.length > 0) {
    result.alerts = { value: alerts.join('|||'), unit: '', category: 'info' };
  }
  
  // Informação sobre ajuste de inchamento se aplicável
  if (sandHumidity !== 'dry') {
    result.sandSwellingNote = { 
      value: `Volume aumentado em 25% para compensar inchamento. Água reduzida em ${Math.round(waterReductionFromSand)}L.`, 
      unit: '', 
      category: 'info' 
    };
  }

  return result;
};

export const concreteCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Concreto',
  description: 'Cálculo de traço, agregados (areia e brita), cimento, água e armadura conforme NBR 6118 e NBR 12655'
};
