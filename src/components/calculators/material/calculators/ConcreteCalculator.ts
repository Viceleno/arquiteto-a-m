
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
  }
];

const calculate = (inputs: Record<string, number | string>): MaterialResult => {
  const validation = MaterialValidator.validateInputs(inputs, [
    { field: 'area', required: true, min: 0.1 },
    { field: 'thickness', required: true, min: 5 },
    { field: 'concreteType', required: true },
    { field: 'slumpType', required: true }
  ]);

  if (!validation.isValid) {
    return {};
  }

  const area = MaterialValidator.sanitizeNumericInput(inputs.area, 0.1);
  const thickness = MaterialValidator.sanitizeNumericInput(inputs.thickness, 10);
  const concreteType = inputs.concreteType as string;
  const slumpType = inputs.slumpType as string;
  
  const volume = area * (thickness / 100); // m³
  const concreteNeeded = volume * 1.05; // 5% de perda

  // Traços conforme ABNT NBR 6118 e NBR 12655
  let cementKg = 0;
  let sandM3 = 0;
  let gravelM3 = 0;
  let waterL = 0;
  let ratio = '';

  switch (concreteType) {
    case 'fck20':
      // Traço 1:2.5:3.5 (cimento:areia:brita)
      cementKg = Math.ceil(concreteNeeded * 280); // 280 kg/m³
      sandM3 = concreteNeeded * 0.7;
      gravelM3 = concreteNeeded * 0.98;
      waterL = Math.ceil(concreteNeeded * 168); // fator a/c = 0.6
      ratio = '1 : 2,5 : 3,5 (cimento:areia:brita)';
      break;
    case 'fck25':
      // Traço 1:2:3 (cimento:areia:brita)
      cementKg = Math.ceil(concreteNeeded * 350); // 350 kg/m³
      sandM3 = concreteNeeded * 0.7;
      gravelM3 = concreteNeeded * 1.05;
      waterL = Math.ceil(concreteNeeded * 175); // fator a/c = 0.5
      ratio = '1 : 2 : 3 (cimento:areia:brita)';
      break;
    case 'fck30':
      // Traço 1:1.5:2.5 (cimento:areia:brita)
      cementKg = Math.ceil(concreteNeeded * 420); // 420 kg/m³
      sandM3 = concreteNeeded * 0.63;
      gravelM3 = concreteNeeded * 1.05;
      waterL = Math.ceil(concreteNeeded * 168); // fator a/c = 0.4
      ratio = '1 : 1,5 : 2,5 (cimento:areia:brita)';
      break;
  }

  // Conversões
  const cementBags = Math.ceil(cementKg / 50); // sacos de 50kg
  const sandTons = (sandM3 * 1.5).toFixed(2); // densidade ~1.5 t/m³
  const gravelTons = (gravelM3 * 1.6).toFixed(2); // densidade ~1.6 t/m³

  // Armadura estimada conforme NBR 6118
  let steelKgM3 = 80; // kg/m³ para lajes convencionais
  if (thickness >= 20) steelKgM3 = 100; // lajes mais espessas
  const steelKg = Math.ceil(volume * steelKgM3);
  const steelBars = Math.ceil(steelKg / 12); // barras de 12mm de 12m ≈ 8.5kg

  // Materiais auxiliares
  const wireKg = Math.ceil(steelKg * 0.02); // 2% do peso do aço em arame recozido
  const spacersUn = Math.ceil(area * 4); // 4 espaçadores por m²
  const plasticsM2 = Math.ceil(area * 1.1); // lona plástica para cura
  const curingCompoundL = Math.ceil(area * 0.2); // composto de cura

  // Ajuste de água baseado no slump
  let waterAdjustment = 1;
  switch (slumpType) {
    case 'low': waterAdjustment = 0.95; break;
    case 'medium': waterAdjustment = 1.0; break;
    case 'high': waterAdjustment = 1.1; break;
  }
  waterL = Math.ceil(waterL * waterAdjustment);

  return {
    // Informações básicas do projeto
    area: { value: area.toFixed(2), unit: 'm²', category: 'info' },
    thickness: { value: thickness, unit: 'cm', category: 'info' },
    volume: { value: volume.toFixed(2), unit: 'm³', category: 'info' },
    
    // Especificações técnicas NBR 6118
    concreteType: { value: concreteType.toUpperCase(), unit: '', category: 'info' },
    slumpType: { value: slumpType, unit: '', category: 'info' },
    
    // Traço de concreto (proporção em massa)
    ratio: { value: ratio, unit: '', category: 'info' },
    concreteNeeded: { value: concreteNeeded.toFixed(2), unit: 'm³ concreto', highlight: true, category: 'primary' },
    
    // Cimento Portland (NBR 12655)
    cementKg: { value: cementKg, unit: 'kg cimento', highlight: true, category: 'primary' },
    cementBags: { value: cementBags, unit: 'sacos 50kg', highlight: true, category: 'primary' },
    
    // Agregado Miúdo - Areia
    sandM3: { value: sandM3.toFixed(2), unit: 'm³ areia média', highlight: true, category: 'primary' },
    sandTons: { value: sandTons, unit: 't areia', category: 'secondary' },
    
    // Agregado Graúdo - Brita
    gravelM3: { value: gravelM3.toFixed(2), unit: 'm³ brita 1', highlight: true, category: 'primary' },
    gravelTons: { value: gravelTons, unit: 't brita', category: 'secondary' },
    
    // Água de amassamento
    waterL: { value: waterL, unit: 'L água', highlight: true, category: 'primary' },
    
    // Armadura CA-50 (NBR 6118)
    steelKg: { value: steelKg, unit: 'kg aço CA-50', highlight: true, category: 'primary' },
    steelBars: { value: steelBars, unit: 'barras Ø12mm', category: 'secondary' },
    
    // Materiais auxiliares
    wireKg: { value: wireKg, unit: 'kg arame recozido', category: 'secondary' },
    spacersUn: { value: spacersUn, unit: 'espaçadores plásticos', category: 'secondary' },
    plasticsM2: { value: plasticsM2, unit: 'm² lona para cura', category: 'secondary' },
    curingCompoundL: { value: curingCompoundL, unit: 'L composto de cura', category: 'secondary' }
  };
};

export const concreteCalculator: CalculationConfig = {
  inputs,
  calculate,
  name: 'Concreto',
  description: 'Cálculo de traço, agregados (areia e brita), cimento, água e armadura conforme NBR 6118 e NBR 12655'
};
