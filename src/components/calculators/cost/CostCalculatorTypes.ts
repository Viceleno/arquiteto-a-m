export interface MaterialComposition {
  name: string;
  unit: string;
  consumption: number; // quantidade por m² ou m³
  unitPrice: number; // preço por unidade
  category: 'material' | 'auxiliary' | 'labor';
}

export interface MaterialInputField {
  key: string;
  label: string;
  type: 'number' | 'select';
  unit?: string;
  required?: boolean;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  tooltip?: string;
  placeholder?: string;
}

export interface MaterialData {
  name: string;
  baseUnit: string;
  inputFields: MaterialInputField[];
  compositions: MaterialComposition[];
  laborProductivity: number; // m²/dia ou m³/dia
  laborHourRate: number; // R$/hora
  hoursPerDay: number; // horas trabalhadas por dia
  wastePercentage: number; // percentual de perda
  calculateQuantity?: (inputs: Record<string, number | string>) => number;
}

export interface CostResult {
  material: string;
  area: number;
  complexity: string;
  materialDetails: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    category: string;
  }>;
  materialTotal: number;
  laborTotal: number;
  subtotal: number;
  bdi: number;
  bdiAmount: number;
  totalCost: number;
  costPerM2: number;
}

export const complexityFactors = {
  simple: { name: 'Simples', factor: 1, description: 'Geometria regular, poucos recortes' },
  medium: { name: 'Média', factor: 1.3, description: 'Geometria com algumas irregularidades' },
  complex: { name: 'Complexa', factor: 1.8, description: 'Geometria irregular, muitos recortes' },
};

export const materialsDatabase: Record<string, MaterialData> = {
  concrete: {
    name: 'Concreto Armado',
    baseUnit: 'm³',
    inputFields: [
      { key: 'area', label: 'Área da Laje', type: 'number', unit: 'm²', required: true, min: 0.1, step: 0.01, tooltip: 'Área total da laje em metros quadrados' },
      { key: 'thickness', label: 'Espessura', type: 'number', unit: 'cm', required: true, defaultValue: 15, min: 8, max: 30, step: 1, tooltip: 'Espessura da laje em centímetros' },
      { 
        key: 'concreteType', 
        label: 'Resistência (FCK)', 
        type: 'select', 
        required: true, 
        defaultValue: 'fck25',
        options: [
          { value: 'fck20', label: 'FCK 20 MPa - Traço 1:2,5:3,5' },
          { value: 'fck25', label: 'FCK 25 MPa - Traço 1:2:3' },
          { value: 'fck30', label: 'FCK 30 MPa - Traço 1:1,5:2,5' },
        ],
        tooltip: 'Resistência característica do concreto conforme NBR 6118'
      },
    ],
    laborProductivity: 8,
    laborHourRate: 35,
    hoursPerDay: 8,
    wastePercentage: 5,
    calculateQuantity: (inputs) => {
      const area = Number(inputs.area || 0);
      const thickness = Number(inputs.thickness || 15);
      return area * (thickness / 100); // volume em m³
    },
    compositions: [
      { name: 'Cimento CP-II ou CP-III', unit: 'saco 50kg', consumption: 7, unitPrice: 28, category: 'material' },
      { name: 'Areia média lavada', unit: 'm³', consumption: 0.64, unitPrice: 85, category: 'material' },
      { name: 'Brita 1 (agregado graúdo)', unit: 'm³', consumption: 0.64, unitPrice: 95, category: 'material' },
      { name: 'Água potável', unit: 'L', consumption: 170, unitPrice: 0.01, category: 'material' },
      { name: 'Aço CA-50 Ø 8mm a 12mm', unit: 'kg', consumption: 120, unitPrice: 8.5, category: 'material' },
      { name: 'Madeira compensada para forma', unit: 'm²', consumption: 4, unitPrice: 25, category: 'auxiliary' },
      { name: 'Arame recozido #18', unit: 'kg', consumption: 2, unitPrice: 12, category: 'auxiliary' },
      { name: 'Espaçadores plásticos', unit: 'unidade', consumption: 4, unitPrice: 0.35, category: 'auxiliary' },
    ]
  },
  brick: {
    name: 'Alvenaria de Tijolos',
    baseUnit: 'm²',
    inputFields: [
      { key: 'area', label: 'Área da Parede', type: 'number', unit: 'm²', required: true, min: 0.1, step: 0.01, tooltip: 'Área total da parede em metros quadrados' },
      { 
        key: 'brickType', 
        label: 'Tipo de Tijolo', 
        type: 'select', 
        required: true, 
        defaultValue: 'ceramic6holes',
        options: [
          { value: 'ceramic6holes', label: 'Cerâmico 6 furos' },
          { value: 'ceramic8holes', label: 'Cerâmico 8 furos' },
          { value: 'concrete', label: 'Bloco de concreto' },
        ],
        tooltip: 'Tipo de tijolo ou bloco a ser utilizado'
      },
    ],
    laborProductivity: 15,
    laborHourRate: 32,
    hoursPerDay: 8,
    wastePercentage: 8,
    compositions: [
      { name: 'Tijolo cerâmico 6 furos', unit: 'unidade', consumption: 55, unitPrice: 1.2, category: 'material' },
      { name: 'Argamassa de assentamento', unit: 'm³', consumption: 0.018, unitPrice: 280, category: 'material' },
      { name: 'Argamassa de revestimento', unit: 'm³', consumption: 0.025, unitPrice: 320, category: 'auxiliary' },
    ]
  },
  paint: {
    name: 'Pintura',
    baseUnit: 'm²',
    inputFields: [
      { key: 'area', label: 'Área a Pintar', type: 'number', unit: 'm²', required: true, min: 0.1, step: 0.01, tooltip: 'Área total a ser pintada' },
      { 
        key: 'coats', 
        label: 'Número de Demãos', 
        type: 'select', 
        required: true, 
        defaultValue: '2',
        options: [
          { value: '1', label: '1 demão' },
          { value: '2', label: '2 demãos' },
          { value: '3', label: '3 demãos' },
        ],
        tooltip: 'Quantidade de camadas de tinta'
      },
      {
        key: 'paintType',
        label: 'Tipo de Tinta',
        type: 'select',
        required: true,
        defaultValue: 'acrylic',
        options: [
          { value: 'acrylic', label: 'Acrílica' },
          { value: 'latex', label: 'Látex' },
          { value: 'enamel', label: 'Esmalte sintético' },
        ],
        tooltip: 'Tipo de tinta a ser aplicada'
      },
    ],
    laborProductivity: 45,
    laborHourRate: 28,
    hoursPerDay: 8,
    wastePercentage: 15,
    compositions: [
      { name: 'Tinta acrílica', unit: 'litro', consumption: 0.25, unitPrice: 45, category: 'material' },
      { name: 'Selador acrílico', unit: 'litro', consumption: 0.15, unitPrice: 35, category: 'auxiliary' },
      { name: 'Massa corrida PVA', unit: 'kg', consumption: 1.2, unitPrice: 8, category: 'auxiliary' },
      { name: 'Lixa para parede', unit: 'folha', consumption: 0.5, unitPrice: 3.5, category: 'auxiliary' },
    ]
  },
  ceramic: {
    name: 'Revestimento Cerâmico',
    baseUnit: 'm²',
    inputFields: [
      { key: 'area', label: 'Área a Revestir', type: 'number', unit: 'm²', required: true, min: 0.1, step: 0.01, tooltip: 'Área total a ser revestida' },
      {
        key: 'tileSize',
        label: 'Tamanho da Peça',
        type: 'select',
        required: true,
        defaultValue: '45x45',
        options: [
          { value: '30x30', label: '30x30 cm' },
          { value: '45x45', label: '45x45 cm' },
          { value: '60x60', label: '60x60 cm' },
          { value: '90x90', label: '90x90 cm' },
        ],
        tooltip: 'Dimensões da cerâmica'
      },
    ],
    laborProductivity: 12,
    laborHourRate: 40,
    hoursPerDay: 8,
    wastePercentage: 10,
    compositions: [
      { name: 'Cerâmica 45x45cm', unit: 'm²', consumption: 1.1, unitPrice: 35, category: 'material' },
      { name: 'Argamassa colante AC-I', unit: 'kg', consumption: 4.5, unitPrice: 1.8, category: 'auxiliary' },
      { name: 'Rejunte', unit: 'kg', consumption: 0.8, unitPrice: 25, category: 'auxiliary' },
      { name: 'Espaçador plástico', unit: 'pç', consumption: 15, unitPrice: 0.15, category: 'auxiliary' },
    ]
  },
  wood: {
    name: 'Piso de Madeira',
    baseUnit: 'm²',
    inputFields: [
      { key: 'area', label: 'Área do Piso', type: 'number', unit: 'm²', required: true, min: 0.1, step: 0.01, tooltip: 'Área total do piso' },
      {
        key: 'woodType',
        label: 'Tipo de Piso',
        type: 'select',
        required: true,
        defaultValue: 'laminate',
        options: [
          { value: 'laminate', label: 'Laminado' },
          { value: 'vinyl', label: 'Vinílico' },
          { value: 'solid', label: 'Madeira maciça' },
          { value: 'engineered', label: 'Madeira engenheirada' },
        ],
        tooltip: 'Tipo de piso de madeira'
      },
    ],
    laborProductivity: 20,
    laborHourRate: 45,
    hoursPerDay: 8,
    wastePercentage: 12,
    compositions: [
      { name: 'Piso laminado', unit: 'm²', consumption: 1.1, unitPrice: 85, category: 'material' },
      { name: 'Manta acústica', unit: 'm²', consumption: 1.05, unitPrice: 12, category: 'auxiliary' },
      { name: 'Rodapé', unit: 'm', consumption: 0.4, unitPrice: 15, category: 'auxiliary' },
      { name: 'Cola para piso', unit: 'kg', consumption: 1.2, unitPrice: 18, category: 'auxiliary' },
    ]
  },
  lighting: {
    name: 'Iluminação',
    baseUnit: 'm²',
    inputFields: [
      { key: 'area', label: 'Área do Ambiente', type: 'number', unit: 'm²', required: true, min: 0.1, step: 0.01, tooltip: 'Área do ambiente a ser iluminado' },
      {
        key: 'ambientType',
        label: 'Tipo de Ambiente',
        type: 'select',
        required: true,
        defaultValue: 'residential',
        options: [
          { value: 'residential', label: 'Residencial' },
          { value: 'commercial', label: 'Comercial' },
          { value: 'industrial', label: 'Industrial' },
        ],
        tooltip: 'Tipo de uso do ambiente'
      },
      {
        key: 'fixtureType',
        label: 'Tipo de Luminária',
        type: 'select',
        required: true,
        defaultValue: 'led',
        options: [
          { value: 'led', label: 'LED' },
          { value: 'fluorescent', label: 'Fluorescente' },
          { value: 'incandescent', label: 'Incandescente' },
        ],
        tooltip: 'Tipo de luminária'
      },
      { key: 'fixtureWattage', label: 'Potência por Luminária', type: 'number', unit: 'W', required: true, defaultValue: 15, min: 5, max: 100, step: 1, tooltip: 'Potência de cada luminária em Watts' },
      { key: 'ceilingHeight', label: 'Pé-direito', type: 'number', unit: 'm', required: true, defaultValue: 2.7, min: 2.2, max: 5, step: 0.1, tooltip: 'Altura do pé-direito' },
    ],
    laborProductivity: 30,
    laborHourRate: 55,
    hoursPerDay: 8,
    wastePercentage: 5,
    calculateQuantity: (inputs) => {
      const area = Number(inputs.area || 0);
      const ambientType = inputs.ambientType || 'residential';
      const fixtureWattage = Number(inputs.fixtureWattage || 15);
      
      // Iluminância recomendada (lux) por tipo de ambiente
      const luxRequirements: Record<string, number> = {
        residential: 150,
        commercial: 300,
        industrial: 500,
      };
      
      const requiredLux = luxRequirements[ambientType as string] || 150;
      const lumensPerWatt = 80; // LED típico
      const totalLumens = requiredLux * area;
      const lumensPerFixture = fixtureWattage * lumensPerWatt;
      const quantity = Math.ceil(totalLumens / lumensPerFixture);
      
      return quantity;
    },
    compositions: [
      { name: 'Luminária LED', unit: 'unidade', consumption: 1, unitPrice: 85, category: 'material' },
      { name: 'Cabo flexível 2,5mm²', unit: 'm', consumption: 8, unitPrice: 3.5, category: 'auxiliary' },
      { name: 'Eletroduto rígido 3/4"', unit: 'm', consumption: 5, unitPrice: 8, category: 'auxiliary' },
      { name: 'Caixa de passagem 4x2"', unit: 'unidade', consumption: 0.5, unitPrice: 4.5, category: 'auxiliary' },
      { name: 'Interruptor simples', unit: 'unidade', consumption: 0.3, unitPrice: 12, category: 'auxiliary' },
    ]
  },
  roofing: {
    name: 'Telhado',
    baseUnit: 'm²',
    inputFields: [
      { key: 'area', label: 'Área de Cobertura', type: 'number', unit: 'm²', required: true, min: 0.1, step: 0.01, tooltip: 'Área total da cobertura (área inclinada)' },
      {
        key: 'tileType',
        label: 'Tipo de Telha',
        type: 'select',
        required: true,
        defaultValue: 'ceramic',
        options: [
          { value: 'ceramic', label: 'Cerâmica' },
          { value: 'concrete', label: 'Concreto' },
          { value: 'metal', label: 'Metálica' },
          { value: 'fiber', label: 'Fibrocimento' },
        ],
        tooltip: 'Material da telha'
      },
      { key: 'slope', label: 'Inclinação', type: 'number', unit: '%', required: true, defaultValue: 30, min: 5, max: 60, step: 5, tooltip: 'Inclinação do telhado em percentual' },
      { key: 'roofPlanes', label: 'Número de Águas', type: 'number', unit: '', required: true, defaultValue: 2, min: 1, max: 8, step: 1, tooltip: 'Quantidade de planos do telhado' },
    ],
    laborProductivity: 25,
    laborHourRate: 42,
    hoursPerDay: 8,
    wastePercentage: 15,
    compositions: [
      { name: 'Telha cerâmica', unit: 'm²', consumption: 1.15, unitPrice: 35, category: 'material' },
      { name: 'Madeira para estrutura', unit: 'm', consumption: 1.8, unitPrice: 28, category: 'auxiliary' },
      { name: 'Ripa de madeira', unit: 'm', consumption: 2.5, unitPrice: 6, category: 'auxiliary' },
      { name: 'Caibro', unit: 'm', consumption: 1.2, unitPrice: 18, category: 'auxiliary' },
      { name: 'Prego 18x30', unit: 'kg', consumption: 0.5, unitPrice: 15, category: 'auxiliary' },
      { name: 'Rufo metálico', unit: 'm', consumption: 0.3, unitPrice: 42, category: 'auxiliary' },
      { name: 'Calha PVC', unit: 'm', consumption: 0.2, unitPrice: 35, category: 'auxiliary' },
    ]
  },
};
